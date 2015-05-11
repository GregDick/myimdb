var omdb_URL = 'http://www.omdbapi.com/?';
var $searchForm = $('.search-form');
var $searchBar = $('input[name=search]')[0];

//function to retrieve movie JSON file and add to html
$searchForm.on('submit', function(){
  var movie = $searchBar.value;
  var url = omdb_URL + "t=" + movie + "&r=json";
  console.log(url);
    $.get(url, function(data){
      addMovieInfo(data);
      console.log(data);
  })
  return false;
})
function addMovieInfo(data) {

  var $test = $('.test');
  if (data.Title !== undefined) {
  $test.empty();
  $test.append('<h3>' + data.Title + '</h3><br/>');
  $test.append('<h3>' + data.Year + '</h3><br/>');
  $test.append('<h3>' + data.imdbRating + '</h3><br/>');
  $test.append('<img src=' + data.Poster + '></img>');
  };

    if ( data.Title === undefined){
    $test.empty();
    $test.append('<h3>' + 'Sorry, never heard of it' + '</h3>');
    }





};


