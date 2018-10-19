'use strict';
const express = require('express');
const router = express.Router();
const Diary = require('../models/diary');
const User = require('../models/user');
const loader = require('../models/sequelize-loader');
const Sequelize = loader.Sequelize;
const Op = Sequelize.Op;
const moment = require('moment-timezone');


/* GET home page. */
router.get('/', function(req, res, next) {
  const title = 'ブログ';
  if (req.user){
    Diary.findAll({
      where:{
        createdBy: req.user.id
      },
            // limit : 3,
            //  offset : 0,
      order: [['"updatedAt"', 'DESC']]
    }).then((diaries) => {
      diaries.forEach((diary) => {
        diary.formattedUpdatedAt = moment(diary.updatedAt).tz('Asia/Tokyo').format('YYYY/MM/DD HH:mm');
      });
      res.render('index', {
        title: title,
        user: req.user,
        diaries: diaries
      });
    });
  } else {
    // res.render('index', { title: title, user: req.user });
    res.redirect('/login');
  }
});


router.get('/alldiaries', function (req, res, next) {
  const title = 'ブログ';
  if (req.user) {
  Diary.findAll({
    include: [{
      model: User,
      attributes: ['userId', 'username']
    }],
    order: [
      ['"updatedAt"', 'DESC']
    ]
  }).then((diaries) => {
          diaries.forEach((diary) => {
            diary.formattedUpdatedAt = moment(diary.updatedAt).tz('Asia/Tokyo').format('YYYY/MM/DD HH:mm');
          });
    res.render('alldiaries', {
      title: title,
      user: req.user,
      diaries: diaries
    });
  })
   } else {
     res.redirect('/login');
   }
  });



// router.get('/search', (req, res, next) => {
//   res.render('search');
// })

// router.get('/search', function (req, res, next) {
//   res.render('search');
//   Diary.findAll({
//     where: {
//       text: {
//         [Op.like]: '%' + req.body.result + '%'
//       }
//     }
//   }).then((diaries) => {
//     return res.render('search',{
//       diaries: diaries
//     });
//   }).catch((err) => {console.log(err);})
// });


module.exports = router;
