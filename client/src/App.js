import React, { useState, useEffect } from 'react';
import Board from './Board';
import './index.css';
import axios from 'axios';
import Modal from '@material-ui/core/Modal';
import CountTime from './CountTime'

function App(props) {

    const [winnerName, setWinnerName] = useState('');
    const [appearance, setAppearance] = useState(false);
    const [stepNumber, setStepNumber] = useState(0);
    const [xIsNext, setXIsNext] = useState(true);
    const [winnersListAppears, setWinnersListAppears] = useState('');
    const [boardHistory, setBoardHistory] = useState([{ squares: Array(9).fill(null) }]);
    const [seconds, setSeconds] = useState(0);
    const [isActive, setIsActive] = useState(false);

    useEffect(() => {
        if (winner) {
            setIsActive(false);
            setAppearance(true);
        }
    });

    useEffect(async () => {
        let afterChangeRecordsList = await axios.get('/api/records')
            .then(res => res.data)
            .catch(error => error);
        let recordsListContainer = [];
        afterChangeRecordsList.forEach(element => {
            recordsListContainer.push(
                <li>
                    <div>name: {element.winnerName}</div>
                    <div>date: {element.date}</div>
                    <div>Game duration: {element.gameDuration}s</div>
                </li>
            )
        });
        setWinnersListAppears(recordsListContainer)
    }, []);
    let current = boardHistory[stepNumber];

    useEffect(() => {
        const fetchData = async () => {
            const result = await axios.get(`/api/history`);
            
                try {
                    setBoardHistory(result.data.boardHistory);
                    setStepNumber(result.data.stepNumber)
                    setXIsNext(result.data.xIsNext)
                } catch (err) {
                    console.log(`No history ! ${err}`);
                }
            
        };
        fetchData();
    }, []);

    useEffect(() => {
        setTimeout(()=> {
            const fetchData = async () => {
                const result = await axios.get(`/api/history`);
                debugger
                
                    
                    try {
                        // if (result.data.stepNumber!==stepNumber) {
                        // setSeconds(result.data.seconds)}
                        setIsActive(true)
                        setBoardHistory(result.data.boardHistory);
                        setStepNumber(result.data.stepNumber)
                        setXIsNext(result.data.xIsNext)
                    } catch (err) {
                        console.log(`No history ! ${err}`);
                    }
                }
            // };
            fetchData();
        },1000)
    },);






    let status;
    const modalInText = (
        <div className='modal'>
            <h2 id="simple-modal-title">Add your name to the records:</h2>
            <p id="simple-modal-description">
                write your and press send
              </p>
            <input onChange={(event) => setWinnerName(capitalize(event.target.value))} ></input>
            <button onClick={() => { setAppearance(false); declareRecords(); jumpTo(0); setSeconds(0) }} >send</button>
        </div>
    );

    const capitalize = (string) => {
        if (typeof string === typeof "") {
            let newString = string.charAt(0).toUpperCase() + string.slice(1);
            return newString
        }
    }

    const jumpTo = (step) => {
        let localSeconds = seconds
        if(step == 0 ){setIsActive(false); setSeconds(0); localSeconds = 0}
        setStepNumber(step);
        setXIsNext((step % 2) === 0)
        setBoardHistory(boardHistory.slice(0, step + 1));
        serverHistoryHandler({boardHistory:boardHistory.slice(0, step + 1), stepNumber:step, xIsNext:(step % 2) === 0,seconds:localSeconds})
    }

    const formatDate = (date) => {
        const pad = (num) => { return ('00' + num).slice(-2) }
        let dateStr = date.getUTCFullYear() + '-' +
            pad(date.getUTCMonth() + 1) + '-' +
            pad(date.getUTCDate()) + ' ' +
            pad(date.getUTCHours() + 3) + ':' +
            pad(date.getUTCMinutes()) + ':' +
            pad(date.getUTCSeconds());
        return dateStr;
    };

    const handleClick = (i) => {
        if (stepNumber == 0) { setIsActive(true); jumpTo(0) }
        setBoardHistory(boardHistory.slice(0, stepNumber + 1));
        current = boardHistory[boardHistory.length - 1];
        let squares = current.squares.slice();
        if (calculateWinner(squares) || squares[i]) {
            return;
        }
        squares[i] = xIsNext ? "x" : "o";
        let cloneHistory = boardHistory.slice();
        setStepNumber(cloneHistory.length)
        setBoardHistory(boardHistory.concat([{ squares }]))
        setXIsNext(!xIsNext)
        serverHistoryHandler({boardHistory:boardHistory.concat([{ squares }]), stepNumber:cloneHistory.length, xIsNext:!xIsNext,seconds:seconds})
    }

    const serverHistoryHandler = (infomation) => {
        return axios.post('/api/history', infomation)
            .then(res => res.data)
    }

    const moves = boardHistory.map((step, move) => {
        const desc = move ?
            'Go to move #' + move :
            'Start new game';
        return (
            <li key={move}>
                <button onClick={() => { jumpTo(move) }}>{desc}</button>
            </li>
        );
    });
    try {
        let trying = current.squares
    } catch {
        // window.location.reload(false);
        current = boardHistory[boardHistory.length - 1];
    }
    const winner = calculateWinner(current.squares);
  
    const declareRecords = async () => {
        let recordsList = await axios.get('/api/records')
            .then(res => res.data)
            .catch(error => error);
        let current = recordsList.length + 1;
        let message = {
            "id": `${current}`,
            "winnerName": `${winnerName}`,
            "date": `${formatDate(new Date())}`,
            "gameDuration": `${seconds}`
        }
        let afterChangeRecordsList = await axios.post('/api/records', message)
            .then(res => res.data)
            .catch(error => error);
        let recordsListContainer = [];
        afterChangeRecordsList.forEach(element => {
            recordsListContainer.push(
                <li>
                    <div>Name: {element.winnerName}</div>
                    <div>Date: {element.date}</div>
                    <div>Game duration: {element.gameDuration}s</div>
                </li>
            )
        });
        setWinnersListAppears(recordsListContainer)
        serverHistoryHandler({boardHistory:[{ squares: Array(9).fill(null) }], stepNumber:0, xIsNext:true,seconds:seconds})
    }

    if (winner) {
        status = "Winner: " + winner;
    } else {
        status = "Next player: " + (xIsNext ? "X" : "O");
    }

    function calculateWinner(squares) {
        const lines = [
            [0, 1, 2],
            [3, 4, 5],
            [6, 7, 8],
            [0, 3, 6],
            [1, 4, 7],
            [2, 5, 8],
            [0, 4, 8],
            [2, 4, 6]
        ];
        for (let i = 0; i < lines.length; i++) {
            const [a, b, c] = lines[i];
            if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
                return squares[a];
            }
        }
        return null;
    }

    return (
        <div className="game">
            <div className="game-board">
                <Modal
                    open={appearance}
                    onClose={() => setAppearance(false)}
                    aria-labelledby="simple-modal-title"
                    aria-describedby="simple-modal-description"
                >
                    {modalInText}
                </Modal>
                <p>Game timer: <CountTime isActive={isActive} seconds={seconds} setSeconds={setSeconds} /></p>
                <Board
                    squares={current.squares}
                    onClick={(i) => handleClick(i)}
                />
            </div>
            <div className="game-info">
                <div>{status}</div>
                <ol>{moves}</ol>
                {typeof (winnersListAppears) !== typeof ('') &&
                    <ol>
                        <button onClick={async () => { await axios.delete('/api/records'); setWinnersListAppears('') }} >reset records least</button>
                        {winnersListAppears}</ol>}
            </div>
        </div>
    );
}

export default App;