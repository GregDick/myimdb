// ==========login page Javascript==========
var FIREBASE_AUTH = "https://allthemovies.firebaseio.com/"
var fb = new Firebase(FIREBASE_AUTH);

var $email = $("input[type='email']");
var $password = $("input[type='password']");



$(".login").submit(function(){
  doLogin(saveUserData);
  event.preventDefault();
})

$(".register").click(function(){
  fb.createUser({
    email: $email.val(),
    password: $password.val()
  }, function(err, userData){
    if(err){
      alert(err.toString());
    } else{
        $(".onLoggedOut").hide();
        $(".onRegistered").removeClass("hidden");
        $(".onRegistered").append("<h1>Congratulations! You\'ve registered as "+userData.uid+"</h1>");
      }
  })
  event.preventDefault();
})

$(".continue").click(function(){
  doLogin(saveUserData);
})

$(".reset").click(function(){
  fb.resetPassword({
    email: $email.val()
  }, function (err) {
    if (err) {
      alert(err.toString());
    } else {
      alert('Check your email!');
    }
  });
  event.preventDefault();
})


$(".onTempPassword form").submit(function(){
  var email = fb.getAuth().password.email;
  var $curPass = $(".onTempPassword form input:first");
  var $newPass = $(".onTempPassword form input:last");

  fb.changePassword({
    email: email,
    oldPassword: $curPass.val(),
    newPassword: $newPass.val()
  }, function(err){if (err) {
      alert(err.toString());
    } else {
      fb.unauth();
      alert("Successfully changed password");
      checkStatus();
      $email.val("");
      $password.val("");
    }
  })
  event.preventDefault();
});


//if I'm on movie page and logged in --> Welcome and set user id. Else take me back to login
if(window.location.pathname === "/myimdb/"){
  fb.onAuth(function(authData){
    if(authData){
      $(".welcome").append("<h4>Welcome " + authData.password.email + "</h4>");
      userID = authData.uid;
      userToken = authData.token;
    }
    else{
      window.location.pathname = "/myimdb/login/login.html";
    }
  });
}

$(".logout").click(function(){
  fb.unauth();
})

function doLogin(cb){
  fb.authWithPassword({
    email: $email.val(),
    password: $password.val()
  }, function(error, authData){
      if(error){
        alert(error.toString());
      }
      else{
        typeof cb === 'function' && cb(authData);
      }
    }
  )
}

function checkStatus(){
  if(window.location.pathname = "/myimdb/login/login.html"){
    fb.onAuth(function(authData){
      if(authData && authData.password.isTemporaryPassword){
        $(".onTempPassword").removeClass("hidden");
        $(".onLoggedOut").addClass("hidden");
      } else if(authData){
        window.location.pathname = "/myimdb/";
      } else{
        $(".onTempPassword").addClass("hidden");
        $(".onLoggedOut").removeClass("hidden");
      }
    });
  }
}

function saveUserData(authData){
  var fbURL = fb.child("users/" + authData.uid + "/profile");
  fbURL.set(authData, checkStatus);
}


// =====================================start movie app Javascript======================================

var omdb_URL = 'http://www.omdbapi.com/?';
var $searchForm = $('.search-form');
var $searchBar = $('input[name=search]')[0];
var FIREBASE_URL = FIREBASE_AUTH + "users/" + userID + "/movies.json?auth=" + userToken;
var userID;
var userToken;
var fbMovies;
var $movieDetails = $(".movie-details");
var $table = $("table");


//function to get firebase data and add to table on page load if logged in
if(userID){
  fbMovies = fb.child('users/'+userID+'/movies');
  fbMovies.on('child_added', function(snapshot){
    var obj = {};
    obj[snapshot.key()] = snapshot.val();
    addTableDetail(obj);
  });
}



//function to retrieve movie JSON file and add to html
$searchForm.on('submit', function(){
  var movie = $searchBar.value;
  var url = omdb_URL + "t=" + movie + "&r=json";
  $.get(url, function(data){
    addMovieDetail(data);
  })
  return false;
})


//function to add JSON data to html
function addMovieDetail(data){
  var $target = $(".movie-details");

  if (data.Title === undefined) {
    $target.empty();
    $target.append("<h2>Sorry, never heard of it!</h2>");
  } else {
    $target.empty();
    var poster = data.Poster === "N/A" ? "http://i.imgur.com/rXuQiCm.jpg?1" : 'http://crossorigin.me/' + data.Poster;
    $target.append("<img src=" + poster + "></img>");
    $target.append("<h1>" + data.Title + "</h1>");
    $target.append("<h2> Year: " + data.Year + "</h2>");
    $target.append("<h2> IMDB Rating: " + data.imdbRating + "</h2>");

    $target.append("<button class='btn btn-lg btn-primary add-movie'>Add Movie</button>");
    }
};

//posts movie object to firebase and calls addTableDetail()
$movieDetails.on('click', '.add-movie', function() {
  //note: must be in this format because the .add-movie button is dynamically created
  var movie = $searchBar.value;
  var url = omdb_URL + "t=" + movie + "&r=json";
  fbMovies = fb.child('users/'+userID+'/movies');
  $.get(url, function (data) {
    fbMovies.push(data);
    }, 'jsonp');
 });

//function to append a row to the table
function addTableDetail(obj){
  var id = Object.keys(obj)[0];
  var data = obj[id];
  $table.show();
  $table.append("<tr></tr>");
  var $target = $("tr:last");
  $target.attr("data-id", id);
  var poster = data.Poster === "N/A" ? "http://i.imgur.com/rXuQiCm.jpg?1" : 'http://crossorigin.me/' + data.Poster;
  $target.append("<td><img src=" + poster + "></img></td>");
  $target.append("<td>"+ data.Title +"</td>");
  $target.append("<td>"+ data.Year +"</td>");
  $target.append("<td>"+ data.imdbRating +"</td>");
  $target.append("<td><button class='btn btn-success'>"+ "&#10003" +"</button></td>");
}

//deletes row from table and firebase
$table.on('click', 'button', function(){
  var $movie = $(this).closest('tr');
  var $id = $movie.attr('data-id');
  $movie.remove();
  fb.child('users/' + userID + '/movies/' + $id).set(null);
})
