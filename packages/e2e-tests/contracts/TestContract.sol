// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

contract TestContract {
  struct Director {
    string name;
    address walletAddress;
  }

  enum Status {
    Released,
    Archived
  }

  struct Movie {
    uint256 id;
    string title;
    Status status;
    Director director;
  }

  Movie[] public movies;

  constructor() {
    movies.push(
      Movie({
        id: 0,
        title: 'Catch Me If You Can',
        status: Status.Released,
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
        status: Status.Archived,
        director: Director({
          name: 'Robert Zemeckis',
          walletAddress: 0x86f11f319E53481493Ea50d97eAc684c5Ca8403D
        })
      })
    );
  }

  function getNothing() public pure {}

  function getAnyMovie() public view returns (Movie memory) {
    return movies[0];
  }

  function getAllMovies() public view returns (Movie[] memory) {
    return movies;
  }

  function getMultipleValues() public view returns (string memory, uint256, Director memory) {
    return (movies[0].title, movies[0].id, movies[0].director);
  }

  function getString() public pure returns (string memory) {
    return 'string example';
  }

  function getNamedString() public pure returns (string memory movieTitle) {
    return 'named string example';
  }

  function getBoolean() public pure returns (bool) {
    return true;
  }

  function getAddress() public pure returns (address) {
    return 0xA5ae0b2386De51Aba852551A1EE828BfD598E111;
  }

  function getBytes() public pure returns (bytes32) {
    return keccak256(abi.encodePacked('Hello world'));
  }

  function getUint() public pure returns (uint256) {
    return 1256374125673412563451263546712536712536712573612;
  }

  function getInt() public pure returns (int168) {
    return 125637412567341;
  }

  function getTuple() public pure returns (string[3] memory) {
    return ['0', '1', '2'];
  }

  function overloadedFn() public pure returns (string memory, uint256) {
    return ('overloaded result 0', 0);
  }

  function overloadedFn(uint16) public pure returns (string memory, uint256) {
    return ('overloaded result 1', 1);
  }

  function overloadedFn(
    string memory,
    uint,
    string memory
  ) public pure returns (string memory, uint256) {
    return ('overloaded result 2', 2);
  }

  function passUnnamedString(string memory) public pure returns (string memory) {
    return 'passUnnamedString result';
  }

  function passString(string memory someString) public pure returns (string memory) {
    return someString;
  }

  function passBoolean(bool someBoolean) public pure returns (bool) {
    return someBoolean;
  }

  function passAddress(address someAddress) public pure returns (address) {
    return someAddress;
  }

  function passBytes(bytes32 someBytes) public pure returns (bytes32) {
    return someBytes;
  }

  function passUint(uint256 someUint) public pure returns (uint256) {
    return someUint;
  }

  function passInt(int256 someInt) public pure returns (int256) {
    return someInt;
  }

  function passTuple(string[3] memory someTuple) public pure returns (string[3] memory) {
    return someTuple;
  }

  function passMovie(Movie memory someMovie) public pure returns (Movie memory) {
    return someMovie;
  }

  function mayhem(
    string memory,
    uint256 someUint,
    int256[2] memory,
    Movie[] memory someMovies,
    Director[2] memory someDirectors,
    Status[4] memory someStatuses
  )
    public
    pure
    returns (
      Movie[] memory passedMovies,
      uint256,
      Status[4] memory statuses,
      Director memory director
    )
  {
    return (someMovies, someUint, someStatuses, someDirectors[0]);
  }
}
