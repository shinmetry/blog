'use strict';
const express = require('express');
const router = express.Router();
const authenticationEnsurer = require('./authentication-ensurer');
const uuid = require('node-uuid');
const Diary = require('../models/diary')
const User = require('../models/user')
const moment = require('moment-timezone');
const csrf = require('csurf'); 
const csrfProtection = csrf({ cookie: true });

router.get('/new', authenticationEnsurer, csrfProtection, (req, res, next) => {
  res.render('new', {
    user: req.user, csrfToken: req.csrfToken()
  });
});

router.post('/', authenticationEnsurer, csrfProtection, (req, res, next) => {
  console.log(req.body); 
  const diaryId = uuid.v4();
  const updatedAt = new Date();
  Diary.create({
    diaryId: diaryId,
    diaryName: req.body.diaryName.slice(0, 255),
    text: req.body.text,
    createdBy: req.user.id,
    updatedAt: updatedAt
  }).then((diary) => {
    res.redirect('/posts/' + diary.diaryId);
  });
});

router.get('/:diaryId', authenticationEnsurer, csrfProtection, (req, res, next) => {
  Diary.findOne({
    include: [{
      model: User,
      attributes: ['userId', 'username']
    }],
    where: {
      diaryId: req.params.diaryId
    },
    order: [
      ['"updatedAt"', 'DESC']
    ]
  }).then((diary) => {
    diary.formattedUpdatedAt = moment(diary.updatedAt).tz('Asia/Tokyo').format('YYYY/MM/DD HH:mm');
    if (diary) {
      res.render('diary', {
        user: req.user,
        diary: diary,
        csrfToken: req.csrfToken()
      });
    } else {
      const err = new Error('記事が見つかりません');
      err.status = 404;
      next(err);
    }
  });
});

router.get('/:diaryId/edit', authenticationEnsurer, csrfProtection, (req, res, next) => {
  Diary.findOne({
    where: {
      diaryId: req.params.diaryId
    }
  }).then((diary) => {
    if(isMine(req, diary)){
      diary.formattedUpdatedAt = moment(diary.updatedAt).tz('Asia/Tokyo').format('YYYY/MM/DD HH:mm');
      res.render('edit', {
        user: req.user,
        diary: diary,
        csrfToken: req.csrfToken()
      });
    } else {
      const err = new Error('記事がない、または編集する権限がありません');
      err.status = 404;
      next(err);
    }
  });
});

function isMine(req, diary) {
  return diary && parseInt(diary.createdBy) === parseInt(req.user.id);
}

router.post('/:diaryId', authenticationEnsurer, csrfProtection, (req, res, next) => {
  Diary.findOne({
    where: {
      diaryId: req.params.diaryId
    }
  }).then((diary) => {
    if(diary && isMine(req, diary)){
      if(parseInt(req.query.edit) === 1){
        const updatedAt = new Date();
        diary.update({
          diaryId: diary.diaryId,
          diaryName: req.body.diaryName.slice(0, 255),
          text: req.body.text,
          createdBy: req.user.id,
          updatedAt: updatedAt
        }).then((diary) => {
          res.redirect('/posts/' + diary.diaryId);
        })
      } else if(parseInt(req.query.delete)===1) {
        deleteDiaryAggregate(req.params.diaryId, () => {
          res.redirect('/');
        });
      } else {
        const err = new Error('不正なリクエストです');
        err.status = 400;
        next(err);
      }
    } else {
      const err = new Error('記事がない、または編集する権限がありません');
      err.status = 404;
      next(err);
    }
  });
});

function deleteDiaryAggregate(diaryId, done, err){
        Diary.findById(diaryId).then((d) => {
          d.destroy();
        }).then(() => {
          if (err) return done(err);
          done();
        });
}

module.exports = router;