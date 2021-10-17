const apiKey = "1653543a0ed5fc6af37ecdd99bc75154"
const imageBaseURL = "https://image.tmdb.org/t/p/w300" //w300 is the size
const movieSearchBaseURL = "https://api.themoviedb.org/3/search/movie?"
const recommendedMovieBaseURL = "https://api.themoviedb.org/3/movie/"
const movieByGenreBaseURL = "https://api.themoviedb.org/3/discover/movie?language=en-US&page=1"

// View configuration options: https://api.themoviedb.org/3/configuration?api_key=1653543a0ed5fc6af37ecdd99bc75154
// Recommendations: https://api.themoviedb.org/3/movie/550988/recommendations?api_key=1653543a0ed5fc6af37ecdd99bc75154&language=en-US&page=1
// Get list of Genres and their IDs: https://api.themoviedb.org/3/genre/movie/list?api_key=1653543a0ed5fc6af37ecdd99bc75154&language=en-US

var movieDisplayArray = [];
var userFaveMovieID = 000000;
var genreString = "";
var displayLength = 8;

// Recognise Enter keydown as click button
$("#userInput").keydown(function(event) {
  $("#userInput").trigger("reset");
  if (event.keyCode === 13) {
    event.preventDefault();
    $(".searchSubmit").click();
  }
})

// Extract the user input
$(".searchSubmit").on("click", async () => {
  const userInputValue = $("#userInput").val();
  userMovieSearch = userInputValue.replace(" ", "%20");
  movieDisplayArray = await getMovie(userMovieSearch);
  showUserMovie(movieDisplayArray);
  // const userMovie = await getMovie(userMovieSearch);
  // showUserMovie(userMovie);
})

// Get user's selected movie
const getMovie = async (userMovieSearch) => {
  const searchMovieURL = `${movieSearchBaseURL}query=${userMovieSearch}&api_key=${apiKey}&language=en-US&page=1`
  try {
    const response = await axios.get(searchMovieURL);

    const resultsArray = (response.data.results).slice(0, displayLength);

    return customMovieArray(resultsArray)

  } catch (error) {
    console.log(`Error! ${error}`);
  }
}

function customMovieArray(resultsArray) {
  movieDisplayArray = [];

  function Movie(id, title, date, overview, vote, poster) {
    this.id = id;
    this.title = title;
    this.date = date;
    this.overview = overview;
    this.vote = vote;
    this.poster = poster;
  };

  for (var i = 0; i < resultsArray.length; i++) {
    var movie = new Movie(
      resultsArray[i].id,
      resultsArray[i].original_title,
      resultsArray[i].release_date,
      resultsArray[i].overview,
      resultsArray[i].vote_average,
      imageBaseURL + resultsArray[i].poster_path
    );
    movieDisplayArray.push(movie);
  }

  return movieDisplayArray;
}

//show results on site
const showUserMovie = async (movieDisplayArray) => {
  if (movieDisplayArray.length < displayLength) {
    for (var j = movieDisplayArray.length; j < displayLength; j++) {
      $(`#title${j}`).text("No results found");
      $(`#releaseDate${j}`).text("No results found");
      $(`#vote${j}`).text("No results found")
      $(`#description${j}`).text("No results found");
      $(`#poster${j}`).attr("src", "")
    }
  } else {
    for (var i = 0; i < movieDisplayArray.length; i++) {
      $(`#title${i}`).text(movieDisplayArray[i].title);
      $(`#releaseDate${i}`).text(movieDisplayArray[i].date);
      $(`#vote${i}`).text(`Rating = ${(movieDisplayArray[i].vote).toFixed(2)} / 10`)
      $(`#description${i}`).text(movieDisplayArray[i].overview);
      $(`#poster${i}`).attr("src", movieDisplayArray[i].poster);
    }
  }
};

// Get user's selection of favorite movie from selectMovie button
$(".selectMovie").on("click", async function(event) {
  const userFaveMovie = parseInt(event.target.innerText) - 1;
  userFaveMovieID = movieDisplayArray[userFaveMovie].id;
  $("#userInput").val(movieDisplayArray[userFaveMovie].title);
  movieDisplayArray = await recommendations(userFaveMovieID);
  showUserMovie(movieDisplayArray)
})

// get recommendations based on movie ID
const recommendations = async (userFaveMovieID) => {
  const movieRecommendationsURL = `${recommendedMovieBaseURL}${userFaveMovieID}/recommendations?api_key=${apiKey}&language=en-US&page=1`
  try {
    const response = await axios.get(movieRecommendationsURL);
    const resultsArray = (response.data.results).slice(0, displayLength);
    return customMovieArray(resultsArray)
  } catch (error) {
    console.log(`Error! ${error}`);
  }
}

// Genre selection
$(".form-select").on("click", async function(event) {
  genreString += (event.target.value).toString() + ","
});

$(".genreSubmit").on("click", async function() {
  movieDisplayArray = await moviesByGenres(genreString)
  showUserMovie(movieDisplayArray)
})

const moviesByGenres = async (genreString) => {
  try {
    const response = await axios.get(`${movieByGenreBaseURL}&api_key=${apiKey}&with_genres=${genreString}`)
    const resultsArray = (response.data.results).slice(0, displayLength);
    return customMovieArray(resultsArray)
  } catch (error) {
    console.log(`ERROR! ${error}`);
  }
}
