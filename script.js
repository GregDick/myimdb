// ==========login page Javascript==========
var FIREBASE_AUTH = "https://movie-appp.firebaseio.com/"
var fb = new Firebase(FIREBASE_AUTH);

var $email = $("input[type='email']");
var $password = $("input[type='password']");

$(".onRegistered").hide();

$(".login").submit(function(){
  doLogin();
  fb.onAuth(function(authData){
    if(authData){
      window.location.href = "/";
    }
    else{}
  })
  event.preventDefault();
})

$(".register").click(function(){
  fb.createUser({
    email: $email.val(),
    password: $password.val()
  }, function(err, userData){
    if(err){
      console.log(err);
    } else{
        $(".onLoggedOut").hide();
        $(".onRegistered").show();
        $(".onRegistered").append("<h1>Congratulations! You\'ve registered as "+userData.uid+"</h1>");
        doLogin();
      }
  })
  event.preventDefault();
})


function doLogin(){
  fb.authWithPassword({
    email: $email.val(),
    password: $password.val()
  }, function(error, authData){
    if(error){
      alert(error);
    }
    else{
      $(".onRegistered").show();
    }
  })
}


// ==========start movie app Javascript==========

if(window.location.href === "http://localhost:8080/"){
  fb.onAuth(function(authData){
    if(authData){
      $(".welcome").append("<h4>Welcome " + authData.password.email + "</h4>");
    }
    else{
      window.location.href = "http://localhost:8080/login";
    }
  })
}

$(".logout").click(function(){
  fb.unauth();
})

var omdb_URL = 'http://www.omdbapi.com/?';
var $searchForm = $('.search-form');
var $searchBar = $('input[name=search]')[0];
var FIREBASE_URL = "https://movie-appp.firebaseio.com/movie-appp.json";
var $movieDetails = $(".movie-details");
var $table = $("table");


//function to get firebase data and add to table on page load
$.get(FIREBASE_URL, function(data){
    if (data===null){
    $table.hide(); //hides table if firebase is empty
  }else{
    Object.keys(data).forEach(function(id){
      addTableDetail(data[id], id);
    });
  }
});


//function to retrieve movie JSON file and add to html
$searchForm.on('submit', function(){
  var movie = $searchBar.value;
  var url = omdb_URL + "t=" + movie + "&r=json";
  console.log(url);
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
    var poster = data.Poster === "N/A" ? "http://i.imgur.com/rXuQiCm.jpg?1" : data.Poster;
    $target.empty();
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
  $.get(url, function (data) {
    $.post(FIREBASE_URL, JSON.stringify(data), function(res){
      addTableDetail(data, res.name);
      });
    }, 'jsonp');
 });

//function to append a row to the table
function addTableDetail(data, id){
  $table.show();
  $table.append("<tr class='hide-rows'></tr>");
  var $target = $("tr:last");
  $target.attr("data-id", id);
  var poster = data.Poster === "N/A" ? "http://i.imgur.com/rXuQiCm.jpg?1" : data.Poster;
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
  var deleteURL = FIREBASE_URL.slice(0, -5) + '/' + $id + '.json';
  $.ajax({
  url: deleteURL,
  type: 'DELETE'
  });
})



