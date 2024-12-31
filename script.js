const pieces = ['♖', '♘', '♗', '♕', '♔', '♗', '♘', '♖'];
    const chessboard = document.getElementById('chessboard');
    let draggedPiece = null;
    let isBluesTurn = true;
    let turnIndicator;
    let isInCheck = false;

    function randomizeBackRow() {
      return [...pieces].sort(() => Math.random() - 0.5);
    }

    function isSquareUnderAttack(square, attackingColor) {
      const row = parseInt(square.dataset.row);
      const col = parseInt(square.dataset.col);
      
      const attackingPieces = Array.from(document.querySelectorAll('.piece')).filter(
        piece => piece.style.color === attackingColor
      );

      for (const piece of attackingPieces) {
        const realDraggedPiece = draggedPiece;
        draggedPiece = piece;
        if (isValidMove(piece, square, true)) {
          draggedPiece = realDraggedPiece;
          return true;
        }
        draggedPiece = realDraggedPiece;
      }
      
      return false;
    }

    function createPiece(type, row, col, color) {
      const piece = document.createElement('div');
      piece.classList.add('piece');
      piece.textContent = type;
      piece.style.color = color;
      piece.draggable = true;
      piece.dataset.row = row;
      piece.dataset.col = col;

      piece.addEventListener('dragstart', (e) => {
        const isBluePiece = piece.style.color === 'blue';
        if (isBluePiece === isBluesTurn) {
          draggedPiece = piece;
          e.dataTransfer.setData('text/plain', null);
        } else {
          e.preventDefault();
        }
      });

      return piece;
    }

    function isPathClear(startRow, startCol, endRow, endCol) {
      const rowStep = startRow === endRow ? 0 : (endRow - startRow) / Math.abs(endRow - startRow);
      const colStep = startCol === endCol ? 0 : (endCol - startCol) / Math.abs(endCol - startCol);
      let currentRow = startRow + rowStep;
      let currentCol = startCol + colStep;

      while (currentRow !== endRow || currentCol !== endCol) {
        const square = document.querySelector(`.square[data-row="${currentRow}"][data-col="${currentCol}"]`);
        if (square.querySelector('.piece')) {
          return false;
        }
        currentRow += rowStep;
        currentCol += colStep;
      }

      return true;
    }

    function getSquaresBetween(startRow, startCol, endRow, endCol) {
      const squares = [];
      const rowStep = startRow === endRow ? 0 : (endRow - startRow) / Math.abs(endRow - startRow);
      const colStep = startCol === endCol ? 0 : (endCol - startCol) / Math.abs(endCol - startCol);
      
      let currentRow = startRow + rowStep;
      let currentCol = startCol + colStep;

      while (currentRow !== endRow || currentCol !== endCol) {
        squares.push(document.querySelector(`.square[data-row="${currentRow}"][data-col="${currentCol}"]`));
        currentRow += rowStep;
        currentCol += colStep;
      }

      return squares;
    }

    function isValidMove(piece, targetSquare, isCheckingForCheck = false) {
      const targetRow = parseInt(targetSquare.dataset.row);
      const targetCol = parseInt(targetSquare.dataset.col);
      const currentRow = parseInt(piece.dataset.row);
      const currentCol = parseInt(piece.dataset.col);
      const pieceType = piece.textContent;
      const isBlue = piece.style.color === 'blue';

      // Check if target square has a friendly piece
      const targetPiece = targetSquare.querySelector('.piece');
      if (targetPiece && targetPiece.style.color === piece.style.color) {
        return false;
      }

      if (!isCheckingForCheck && isBlue !== isBluesTurn) {
        return false;
      }

      if (pieceType === '♘') {
        if ((Math.abs(currentRow - targetRow) === 2 && Math.abs(currentCol - targetCol) === 1) ||
            (Math.abs(currentRow - targetRow) === 1 && Math.abs(currentCol - targetCol) === 2)) {
          return !targetPiece || targetPiece.style.color !== piece.style.color;
        }
        return false;
      }

      switch (pieceType) {
        case '♙':
          if (isBlue) {
            if (currentCol === targetCol && targetRow === currentRow - 1) {
              return !targetPiece && isPathClear(currentRow, currentCol, targetRow, targetCol);
            }
            if (currentCol === targetCol && currentRow === 6 && targetRow === 4) {
              return !targetPiece && isPathClear(currentRow, currentCol, targetRow, targetCol);
            }
            if (Math.abs(currentCol - targetCol) === 1 && targetRow === currentRow - 1) {
              return targetPiece && targetPiece.style.color !== piece.style.color;
            }
          } else {
            if (currentCol === targetCol && targetRow === currentRow + 1) {
              return !targetPiece && isPathClear(currentRow, currentCol, targetRow, targetCol);
            }
            if (currentCol === targetCol && currentRow === 1 && targetRow === 3) {
              return !targetPiece && isPathClear(currentRow, currentCol, targetRow, targetCol);
            }
            if (Math.abs(currentCol - targetCol) === 1 && targetRow === currentRow + 1) {
              return targetPiece && targetPiece.style.color !== piece.style.color;
            }
          }
          break;
        case '♖':
          if (currentCol === targetCol || currentRow === targetRow) {
            return isPathClear(currentRow, currentCol, targetRow, targetCol);
          }
          break;
        case '♗':
          if (Math.abs(currentRow - targetRow) === Math.abs(currentCol - targetCol)) {
            return isPathClear(currentRow, currentCol, targetRow, targetCol);
          }
          break;
        case '♕':
          if (currentCol === targetCol || currentRow === targetRow || 
              Math.abs(currentRow - targetRow) === Math.abs(currentCol - targetCol)) {
            return isPathClear(currentRow, currentCol, targetRow, targetCol);
          }
          break;
        case '♔':
          if (Math.abs(currentRow - targetRow) <= 1 && Math.abs(currentCol - targetCol) <= 1) {
            return isPathClear(currentRow, currentCol, targetRow, targetCol);
          }
          break;
      }
      return false;
    }

    function findAttackingPieces(kingColor) {
      const kingPiece = Array.from(document.querySelectorAll('.piece')).find(piece => 
        piece.textContent === '♔' && piece.style.color === kingColor
      );
      
      const kingRow = parseInt(kingPiece.dataset.row);
      const kingCol = parseInt(kingPiece.dataset.col);
      const kingSquare = document.querySelector(`.square[data-row="${kingRow}"][data-col="${kingCol}"]`);
      
      return Array.from(document.querySelectorAll('.piece')).filter(piece => {
        if (piece.style.color === kingColor) return false;
        
        const realDraggedPiece = draggedPiece;
        draggedPiece = piece;
        const canAttack = isValidMove(piece, kingSquare, true);
        draggedPiece = realDraggedPiece;
        
        return canAttack;
      });
    }

    function isKingInCheck(kingColor) {
      const kingPiece = Array.from(document.querySelectorAll('.piece')).find(piece => 
        piece.textContent === '♔' && piece.style.color === kingColor
      );
      
      if (!kingPiece) return false;
      
      const kingRow = parseInt(kingPiece.dataset.row);
      const kingCol = parseInt(kingPiece.dataset.col);
      const kingSquare = document.querySelector(`.square[data-row="${kingRow}"][data-col="${kingCol}"]`);
      
      return isSquareUnderAttack(kingSquare, kingColor === 'blue' ? 'red' : 'blue');
    }

    function canMoveWithoutCheck(piece, targetSquare) {
      const targetPiece = targetSquare.querySelector('.piece');
      if (targetPiece && targetPiece.style.color === piece.style.color) {
        return false;
      }

      const originalSquare = piece.parentNode;
      const originalRow = piece.dataset.row;
      const originalCol = piece.dataset.col;
      
      if (isValidMove(piece, targetSquare, true)) {
        if (targetPiece) {
          targetSquare.removeChild(targetPiece);
        }
        piece.dataset.row = targetSquare.dataset.row;
        piece.dataset.col = targetSquare.dataset.col;
        targetSquare.appendChild(piece);
        
        const isStillInCheck = isKingInCheck(piece.style.color);
        
        piece.dataset.row = originalRow;
        piece.dataset.col = originalCol;
        originalSquare.appendChild(piece);
        if (targetPiece) {
          targetSquare.appendChild(targetPiece);
        }
        
        return !isStillInCheck;
      }
      
      return false;
    }

    function isCheckmate(kingColor) {
      if (!isKingInCheck(kingColor)) {
        return false;
      }

      const kingPiece = Array.from(document.querySelectorAll('.piece')).find(piece => 
        piece.textContent === '♔' && piece.style.color === kingColor
      );
      
      const kingRow = parseInt(kingPiece.dataset.row);
      const kingCol = parseInt(kingPiece.dataset.col);
      const opposingColor = kingColor === 'blue' ? 'red' : 'blue';

      // Check all adjacent squares for the king
      for (let rowOffset = -1; rowOffset <= 1; rowOffset++) {
        for (let colOffset = -1; colOffset <= 1; colOffset++) {
          if (rowOffset === 0 && colOffset === 0) continue;

          const newRow = kingRow + rowOffset;
          const newCol = kingCol + colOffset;

          if (newRow >= 0 && newRow < 8 && newCol >= 0 && newCol < 8) {
            const targetSquare = document.querySelector(`.square[data-row="${newRow}"][data-col="${newCol}"]`);
            const pieceOnSquare = targetSquare.querySelector('.piece');
            
            if (!pieceOnSquare || pieceOnSquare.style.color !== kingColor) {
              if (canMoveWithoutCheck(kingPiece, targetSquare)) {
                return false;
              }
            }
          }
        }
      }

      // Check if any piece can block or capture
      const friendlyPieces = Array.from(document.querySelectorAll('.piece')).filter(
        piece => piece.style.color === kingColor && piece.textContent !== '♔'
      );

      for (const piece of friendlyPieces) {
        for (let row = 0; row < 8; row++) {
          for (let col = 0; col < 8; col++) {
            const targetSquare = document.querySelector(`.square[data-row="${row}"][data-col="${col}"]`);
            if (canMoveWithoutCheck(piece, targetSquare)) {
              return false;
            }
          }
        }
      }

      return true;
    }

    function createChessboard() {
      const backRow = randomizeBackRow();
      const pawnRow = ['♙', '♙', '♙', '♙', '♙', '♙', '♙', '♙'];

      for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
          const square = document.createElement('div');
          square.classList.add('square', (row + col) % 2 === 0 ? 'white' : 'black');
          square.dataset.row = row;
          square.dataset.col = col;

          square.addEventListener('dragover', (e) => {
            e.preventDefault();
          });

          square.addEventListener('drop', (e) => {
            if (draggedPiece) {
              const targetSquare = e.target.closest('.square');
              if (targetSquare && isValidMove(draggedPiece, targetSquare)) {
                if (!canMoveWithoutCheck(draggedPiece, targetSquare)) {
                  alert("Illegal move: King is in check!");
                  return;
                }

                const capturedPiece = targetSquare.querySelector('.piece');
                if (capturedPiece) {
                  targetSquare.removeChild(capturedPiece);
                }

                draggedPiece.dataset.row = targetSquare.dataset.row;
                draggedPiece.dataset.col = targetSquare.dataset.col;
                targetSquare.appendChild(draggedPiece);
                
                const opponentColor = isBluesTurn ? 'red' : 'blue';
                isInCheck = isKingInCheck(opponentColor);
                
                if (isInCheck) {
                  const checkmated = isCheckmate(opponentColor);
                  if (checkmated) {
                    alert(`Checkmate! ${isBluesTurn ? 'Blue' : 'Red'} wins!`);
                    setTimeout(resetGame, 1000);
                  } else {
                    alert(`Check!`);
                  }
                }
                
                if (!isInCheck || !isCheckmate(opponentColor)) {
                  isBluesTurn = !isBluesTurn;
                  turnIndicator.textContent = isBluesTurn ? "Blue's Turn" : "Red's Turn";
                  turnIndicator.style.color = isBluesTurn ? 'blue' : 'red';
                }
                
                draggedPiece = null;
              }
            }
          });

          if (row === 0) {
            const piece = createPiece(backRow[col], row, col, 'red');
            square.appendChild(piece);
          } else if (row === 1) {
            const piece = createPiece(pawnRow[col], row, col, 'red');
            square.appendChild(piece);
          } else if (row === 6) {
            const piece = createPiece(pawnRow[col], row, col, 'blue');
            square.appendChild(piece);
          } else if (row === 7) {
            const piece = createPiece(backRow[col], row, col, 'blue');
            square.appendChild(piece);
          }

          chessboard.appendChild(square);
        }
      }
    }

    function resetGame() {
      while (chessboard.firstChild) {
        chessboard.removeChild(chessboard.firstChild);
      }
      
      isBluesTurn = true;
      isInCheck = false;
      turnIndicator.textContent = "Blue's Turn";
      turnIndicator.style.color = 'blue';
      
      createChessboard();
    }

    function initializeGame() {
      const gameContainer = document.createElement('div');
      gameContainer.classList.add('game-container');
      chessboard.parentNode.insertBefore(gameContainer, chessboard);
      gameContainer.appendChild(chessboard);

      const resetButton = document.createElement('button');
      resetButton.id = 'resetButton';
      resetButton.textContent = 'Reset';
      resetButton.addEventListener('click', resetGame);
      gameContainer.appendChild(resetButton);

      turnIndicator = document.createElement('div');
      turnIndicator.id = 'turnIndicator';
      turnIndicator.style.textAlign = 'center';
      turnIndicator.textContent = "Blue's Turn";
      chessboard.parentNode.insertBefore(turnIndicator, chessboard);

      createChessboard();
    }

    initializeGame();
