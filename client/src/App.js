import React, { useState, useEffect } from 'react';
import Board from './Board';
import './index.css';
import axios from 'axios';
import Modal from '@material-ui/core/Modal';
import CountTime from './CountTime';
import WinnersList from "./WinnersList";

function App(props) {

    const [winnerName, setWinnerName] = useState('');
    const [appearance, setAppearance] = useState(false);
    const [stepNumber, setStepNumber] = useState(0);
    const [xIsNext, setXIsNext] = useState(true);
    const [winnersList, setWinnersList] = useState(<li>helloe world</li>);
    const [boardHistory, setBoardHistory] = useState([{ squares: Array(9).fill(null) }]);
    const [seconds, setSeconds] = useState(0);
    const [isActive, setIsActive] = useState(false);
    const [recordsUpdated, setRecordsUpdated] = useState('')
    const [afterChangeRecords, setAfterChangeRecords] = useState(['hello', 'you'])
    // const [ifRender, setIfRender] = useState(true);



    let status;
    const modalInText = (
        <div className='modal'>
            <h2>Add your name to the records:</h2>
            <p>write your name and press send</p>
            <input onChange={event => setWinnerName(capitalize(event.target.value))}></input>
            <button onClick={() => { declareRecords(); }} >send</button>
        </div >
    );

    let current = boardHistory[boardHistory.length - 1];
    let winner = calculateWinner(current.squares);

    if (winner) {
        status = "Winner: " + winner;
    } else {
        status = "Next player: " + (xIsNext ? "X" : "O");
    }

    const moves = boardHistory.map((step, move) => {
        const desc = move ?
            'Go to move #' + move :
            'Start new game';
        return (
            <li key={move}>
                <button onClick={() => jumpTo(move)}>{desc}</button>
            </li>
        );
    });



    useEffect(() => {
        if (winner) {
            setIsActive(false);
            setAppearance(true);
        } else {
            setAppearance(false);
        }
    }, [winner]);



    useEffect(() => {
        const updateWinnerList = async () => {
            let afterChangeRecordsList = await axios.get('/api/v1/records')
                .then(res => res.data)
                .catch(error => error);
            setAfterChangeRecords(afterChangeRecordsList);
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
            setWinnersList(recordsListContainer)
        }
        updateWinnerList()

    }, []);

    useEffect(() => {
        const updateWinnerList = async () => {
            let afterChangeRecordsList = await axios.get('/api/v1/records')
                .then(res => res.data)
                .catch(error => error);
            setAfterChangeRecords(afterChangeRecordsList);
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
            setWinnersList(recordsListContainer)
        }
        updateWinnerList()

    }, [winner, recordsUpdated]);

    useEffect(() => {
        const loadData = async () => {
            const result = await axios.get(`/api/v1/history`);
            setBoardHistory(result.data.boardHistory);
            setStepNumber(result.data.stepNumber)
            setXIsNext(result.data.xIsNext)
        };
        loadData();
    }, []);

    const fetchData = async () => {
        const result = await axios.get(`/api/v1/history`);
        // const updatedSeconds = await axios.put(`/api/v1/history`, { seconds })
        if (winner) {
            setIsActive(false);
        } else if (stepNumber > 0 && !winner) { setIsActive(true) }
        // setSeconds(updatedSeconds.data.seconds + 1)
        setBoardHistory(result.data.boardHistory);
        setStepNumber(result.data.stepNumber)
        setXIsNext(result.data.xIsNext)
    }

    // useEffect(() => {
    //     setTimeout(() => {


    //         setRecordsUpdated(recordsUpdated + 1);
    //     }, 500)
    // });

    useEffect(() => {
        let interval = null;
        if (!winner) {
            interval = setInterval(() => {
                fetchData();
            }, 500);
        }
    }, [true]);


    const capitalize = (string) => {
        if (typeof string === typeof "") {
            let newString = string.charAt(0).toUpperCase() + string.slice(1);
            return newString
        }
    }

    const jumpTo = (step) => {
        let localSeconds = seconds
        if (step == 0) { setSeconds(0); localSeconds = 0 }
        serverHistoryHandler({ boardHistory: boardHistory.slice(0, step + 1), stepNumber: step, xIsNext: (step % 2) === 0, seconds: localSeconds })
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
        setIsActive(true)
        current = boardHistory[boardHistory.length - 1];
        let squares = current.squares.slice();
        if (calculateWinner(squares) || squares[i]) {
            return;
        }
        squares[i] = xIsNext ? "x" : "o";
        let cloneHistory = boardHistory.slice();
        serverHistoryHandler({ boardHistory: boardHistory.concat([{ squares }]), stepNumber: cloneHistory.length, xIsNext: !xIsNext, seconds: seconds + 1 })
    }

    const serverHistoryHandler = (infomation) => {
        return axios.post('/api/v1/history', infomation)
            .then(res => res.data)
    }

    const declareRecords = async () => {
        let recordsList = await axios.get('/api/v1/records')
            .then(res => res.data)
            .catch(error => error);
        let current = recordsList.length + 1;
        debugger
        if(recordsList[0].winnerName == "no body") {
            current = recordsList.length
        }
        let message = {
            "id": `${current}`,
            "winnerName": `${winnerName}`,
            "date": `${formatDate(new Date())}`,
            "gameDuration": `${seconds}`
        }
        let afterChangeRecordsList = await axios.post('/api/v1/records', message)
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
        serverHistoryHandler({ boardHistory: [{ squares: Array(9).fill(null) }], stepNumber: 0, xIsNext: true, seconds: seconds })
        setWinnersList(recordsListContainer)
        setAppearance(false);
        setSeconds(0);
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
            <h1 className='headLine' >Tic Tac Toe</h1>
            <p>Game timer: <CountTime isActive={isActive} seconds={seconds} setSeconds={setSeconds} /></p>
            <div className='status' >{status}</div>
            <div className='game-area'>
                <Modal
                    open={appearance}
                    onClose={() => setAppearance(false)}
                    aria-labelledby="simple-modal-title"
                    aria-describedby="simple-modal-description"
                >
                    {modalInText}
                </Modal>
                {/* {typeof (winnersList) !== typeof ('') &&
                    <ol className='winnerList' >
                        
                        {winnersList}</ol>} */}
                <WinnersList afterChangeRecordsList={afterChangeRecords} setRecordsUpdated={setRecordsUpdated} recordsUpdated={recordsUpdated}  />
                <div className="game-board">
                    <Board
                        squares={current.squares}
                        onClick={(i) => handleClick(i)}
                    />
                </div>
                <div className="game-info">

                    <ol className='moves' >{moves}</ol>
                </div>

            </div>
        </div>
    );
}

export default App;