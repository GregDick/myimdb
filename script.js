var omdb_URL = 'http://www.omdbapi.com/?';
var $searchForm = $('.search-form');
var $searchBar = $('input[name=search]')[0];
var FIREBASE_URL = "https://movie-appp.firebaseio.com/movie-appp.json";
var $movieDetails = $(".movie-details");


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

    $target.append("<button class='add-movie'>Add Movie</button>");
    }
};

//posts movie object to firebase and calls addTableDetail()
$movieDetails.on('click', '.add-movie', function() {
  //note: must be in this format because the .add-movie button is dynamically created
  var movie = $searchBar.value;
  var url = omdb_URL + "t=" + movie + "&r=json";
  $.get(url, function (data) {
    $.post(FIREBASE_URL, JSON.stringify(data));
    addTableDetail(data);
    }, 'jsonp');
 });

//function to append a row to the table
function addTableDetail(data){
  var $table = $("table");
  $table.append("<tr></tr>");
  var $target = $("tr:last");
  var poster = data.Poster === "N/A" ? "http://i.imgur.com/rXuQiCm.jpg?1" : data.Poster;
  $target.append("<td><img src=" + poster + "></img></td>");
  $target.append("<td>"+ data.Title +"</td>");
  $target.append("<td>"+ data.Year +"</td>");
  $target.append("<td>"+ data.imdbRating +"</td>");
  $target.append("<button class='btn btn-success'>"+ "&#10003" +"</button>");
}


