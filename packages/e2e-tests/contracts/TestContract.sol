// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

contract TestContract {
  struct Director {
    string name;
    address walletAddress;
  }

  struct Movie {
    uint256 id;
    string title;
    Director director;
  }

  Movie[] public movies;

  constructor() {
    movies.push(
      Movie({
        id: 0,
        title: 'Catch Me If You Can',
        director: Director({
          name: 'Steven Spielberg',
          walletAddress: 0xA5ae0b2386De51Aba852551A1EE828BfD598E111
        })
      })
    );
    movies.push(
      Movie({
        id: 1,
        title: 'Forrest Gump',
        director: Director({
          name: 'Robert Zemeckis',
          walletAddress: 0x86f11f319E53481493Ea50d97eAc684c5Ca8403D
        })
      })
    );
  }

  function getAnyMovieTitle() public view returns (string memory) {
    return movies[0].title;
  }

  function getAnyMovieDetails() public view returns (string memory, uint256, Director memory) {
    return (movies[0].title, movies[0].id, movies[0].director);
  }

  function getAnyMovie() public view returns (Movie memory) {
    return movies[0];
  }

  function getAllMovies() public view returns (Movie[] memory) {
    return movies;
  }

  function getByte32Example() public pure returns (bytes32) {
    return keccak256(abi.encodePacked('Hello world'));
  }
}
