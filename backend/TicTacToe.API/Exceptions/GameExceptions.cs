namespace TicTacToe.API.Exceptions;

public class GameNotFoundException(string gameId)
    : Exception($"Game '{gameId}' was not found.") { }

public class InvalidMoveException(string reason)
    : Exception(reason) { }

public class GameAlreadyCompletedException()
    : Exception("The game is already completed. No more moves are allowed.") { }
