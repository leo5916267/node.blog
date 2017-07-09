const express = require('express');
const router  = express.Router();

//Bring In Article Model
let Article = require('../models/article');
//User Model
let User = require('../models/user');

//add Route
router.get('/add',ensureAuthenticated,function(req,res){
  res.render('add_article',{
    title:"Add Article"
  });
});

//add Submit
router.post('/add',function(req,res) {

  req.checkBody('title','Title is reequired').notEmpty();
  //req.checkBody('author','Author is reequired').notEmpty();
  req.checkBody('body','Body is reequired').notEmpty();

  //Get Errors
  let errors = req.validationErrors();

  if(errors){
    res.render('add_article',{
      title:"Add Article",
      errors:errors
    });
  }else{
    let article = new Article();
    article.title =req.body.title;
    article.author =req.user._id;
    article.body  =req.body.body;

    article.save(function(err){
      if(err){
        console.log(err);
        return;
      }else{
        req.flash('success',"Article Added");
        res.redirect('/');
      }
    });
  } 
});

//Edit  Article
router.get('/edit/:id',ensureAuthenticated,function(req,res) {
  Article.findById(req.params.id,function(err,article) {
    if(article.author != req.user._id){
      req.flash('danger','Not Authorized');
      res.redirect('/');
    }
    res.render('edit_article',{
     title:"Edit Article",
     article:article
   });
  });
});

//Update Submit
router.post('/edit/:id',function(req,res) {

  let article ={};
  article.title =req.body.title;
  article.author =req.body.author;
  article.body  =req.body.body;

  let query = {_id:req.params.id}

  Article.update(query,article,function(err){

    if(err){
      console.log(err);
      return;
    }else{
      req.flash('success',"Article Updated");
      res.redirect('/');
    }

  });
});

router.delete('/:id',function(req,res){

  if(!req.user._id){
    res.status(500).send();
  }
  let query = {_id:req.params.id}
  //防駭 如果有人直接用網址近來修改 也可以擋住
  Article.findById(req.params.id,function(err,article){
    if(article.author != req.user._id){
      res.status(500).send();
    }else{
      Article.remove(query,function(err){
        if(err){
          console.log(err);
        }else{
          res.send("Success");
        }
      });
    }
  });
});

//Load Edit Form順序有差 放在  add前面 會先讀/article/:id 會把 '/article/add' 的add 當作:id
router.get('/:id',function (req,res) {

  Article.findById(req.params.id,function(err,article) {
    User.findById(article.author,function(err,user){
      res.render('article',{
        article:article,
        author:user.name
      });
    })
  });
});

//Access Control
function ensureAuthenticated(req,res,next){
  if(req.isAuthenticated()){
    return next();
  }else{
    req.flash('danger','Please Login');
    res.redirect('/users/login');
  }
}

module.exports = router;