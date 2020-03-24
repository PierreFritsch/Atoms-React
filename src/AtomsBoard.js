import React from 'react';
import AtomsCell from './AtomsCell';

const LINES = 6;
const COLUMNS = 10;
const COLOR_BLUE = "blue";
const COLOR_RED = "red";

export default class AtomsBoard extends React.Component {

  constructor(props) {
    super(props);
    
    this.state = {
      currentPlayer: COLOR_BLUE,
      allPlayersPlayed: false,
      gameOver: false,
      winner: null,
      cells: Array.from(
        Array(LINES), 
        (_, line) => Array.from(
          new Array(COLUMNS), 
          (_, column) => { 
            return {
              line: line,
              column: column,
              color: null,
              value: 0,
              popping: false
            };
          }
        )
      )
    };
  }

  render() {
    const status = this.state.gameOver ? 'Game over' : ('Next player: ' + this.state.currentPlayer);
  
    return (
      <div>
        <div className="status">{status}</div>
        {this.state.cells.map((cellsRow, line) => {
          return <div key={"row" + line} className="board-row">
            {cellsRow.map((cell, column) => {
              return <AtomsCell 
                key={"cell" + line + "," + column}
                line={line}
                column={column}
                value={cell.value}
                color={cell.color}
                onClick={this.cellClicked.bind(this)}
              ></AtomsCell>
            })}
          </div>;
        })}
      </div>
    );
  }

  cellClicked(line, column) {
    let cell = this.state.cells[line][column];

    // Prevent invalid clicks
    if (this.state.gameOver) {
      return;
    }
    if (cell.color !== null && cell.color !== this.state.currentPlayer) {
      return;
    }

    this.setState(state => ({
      currentPlayer: this.state.currentPlayer === COLOR_BLUE ? COLOR_RED : COLOR_BLUE,
      allPlayersPlayed: this.state.allPlayersPlayed || this.state.currentPlayer === COLOR_RED,
      cells: state.cells.map((row, rowIndex) => 
        row.map((cell, colIndex) => {
          if (rowIndex === line && colIndex === column) {
            var updatedCell = {...cell}; 
            updatedCell.value = cell.value + 1;
            updatedCell.color = state.currentPlayer;
            return updatedCell;
          } else {
            return cell;
          }
        })
      )
    }));
  }

  componentDidUpdate() {
    // Pop overloaded cells
    this.state.cells.forEach((cellsRow, line) => {
      cellsRow.forEach((cell, column) => {
        let neighbors = this.getNeighbors(line, column);
        if ((!cell.popping) && (cell.value >= neighbors.length)) {
          console.log("Pop!");
          this.popCell(line, column);
        }
      });
    });

    // Detect end of game
    if (this.state.gameOver || !this.state.allPlayersPlayed) {
      return;
    }

    let numberOfBlueCells = this.state.cells.reduce((count, row) => {
      return count + row.filter(cell => cell.color === COLOR_BLUE).length
    }, 0);
    let numberOfRedCells = this.state.cells.reduce((count, row) => {
      return count + row.filter(cell => cell.color === COLOR_RED).length
    }, 0);
    console.log(numberOfBlueCells + " blue cells, " + numberOfRedCells + " red cells");
    if (numberOfBlueCells && !numberOfRedCells) {
      this.setState({
        gameOver: true,
        winner: COLOR_BLUE
      });
    }
    if (numberOfRedCells && !numberOfBlueCells) {
      this.setState({
        gameOver: true,
        winner: COLOR_RED
      });
    }
  }
  
  popCell(line, column) {
    // Allow max. 1 simultaneous pop per cell
    this.setState(
      state => ({
        cells: state.cells.map(row => 
          row.map(cell => {
            if (cell.line === line && cell.column === column) {
              let newCell = {...cell};
              newCell.popping = true;
              return newCell; 
            }
            return cell;
          })
        )
      })
    );

    setTimeout(() => {
      this.executePop(line, column);
    }, 350 + Math.random() * 300);
  }

  executePop(line, column) {
    this.setState(state => {
      let cells = JSON.parse(JSON.stringify(state.cells));
      let cell = cells[line][column];
      let neighbors = this.getNeighbors(line, column, cells);
      
      neighbors.forEach(neighborCell => {
        neighborCell.value = neighborCell.value + 1;
        neighborCell.color = cell.color;
      });

      cell.value = cell.value - neighbors.length;
      if (cell.value === 0) {
        cell.color = null;
      }
      cell.popping = false;

      return {cells: cells};
    });
  }

  popCellBefore(line, column) {
    let cell = this.state.cells[line][column];
    let neighbors = this.getNeighbors(line, column);

    if ((!cell.popping) 
        && cell.value >= neighbors.length) {
      this.setState({popping: true})
      let self = this; 
      setTimeout(function () {
        self.setState(state => { 
          return {
            popping: false,
            count: state.count - neighbors.length
          };
        })
        neighbors.forEach(neighborCell => {
          neighborCell.setState(state => {
            return {
             count: state.count + 1
            }
          })
        });
      }, 350);
    }
  }

  getNeighbors(line, column, cells = this.state.cells) {
    var neighbors = []
    if (line > 0) {
      neighbors.push(cells[line - 1][column])
    }
    if (column > 0) {
      neighbors.push(cells[line][column - 1])
    }
    if (line + 1 < LINES) {
      neighbors.push(cells[line + 1][column])
    }
    if (column + 1 < COLUMNS) {
      neighbors.push(cells[line][column + 1])
    }
    return neighbors;
  }
}
  