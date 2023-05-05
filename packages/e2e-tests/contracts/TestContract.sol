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

  function getAnyMovie() public view returns (Movie memory) {
    return movies[0];
  }

  function getAllMovies() public view returns (Movie[] memory) {
    return movies;
  }

  function getMultipleValuesExample()
    public
    view
    returns (string memory, uint256, Director memory)
  {
    return (movies[0].title, movies[0].id, movies[0].director);
  }

  function getByteExample() public pure returns (bytes32) {
    return keccak256(abi.encodePacked('Hello world'));
  }

  function getBooleanExample() public pure returns (bool) {
    return true;
  }

  function getStringExample() public pure returns (string memory) {
    return 'string example';
  }

  function getUintExample() public pure returns (uint256) {
    return 1256374125673412563451263546712536712536712573612;
  }

  function getIntExample() public pure returns (int168) {
    return 125637412567341;
  }

  function getTupleExample() public pure returns (string[3] memory) {
    return ['0', '1', '2'];
  }

  function overloadedFn() public pure returns (string memory) {
    return 'overloaded result 0';
  }

  function overloadedFn(uint16) public pure returns (string memory) {
    return 'overloaded result 1';
  }

  function overloadedFn(string memory, uint, string memory) public pure returns (string memory) {
    return 'overloaded result 2';
  }
}
