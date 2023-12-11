import React, { useState, useEffect, useRef } from 'react';
import { toast } from 'react-toastify';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
const Target = () => {
  const [userId, setUserID] = useState('');
  const [amount, setAmount] = useState(0);
  const [upDown, setUpDown] = useState('RollUnder');
  const [buttonColor1, setButtonColor1] = useState('bg-sky-600');
  const [buttonColor2, setButtonColor2] = useState('bg-gray-300');
  const [target, setTarget] = useState(0);
  const [playNumber, setPlayNumber] = useState(1);
  const [userToken, setUserToken] = useState('');
  const socketRef = useRef(null);
  const [playData, setPlayData] = useState([]);
  let username = '';
  function handleChangeUserId(event) {
    setUserID(event.target.value);
  }
  function handleChangeAmount(event) {
    setAmount(event.target.value);
  }
  function handleChangeTarget(event) {
    setTarget(event.target.value);
  }
  function handleChangePlayNumber(event) {
    setPlayNumber(parseInt(event.target.value));
  }
  function handleChangeUpdown(status) {
    if (status === 'up') {
      setUpDown('RollUnder');
      setButtonColor1('bg-sky-600');
      setButtonColor2('bg-gray-300');
    } else if (status === 'down') {
      setUpDown('RollOver');
      setButtonColor1('bg-gray-300');
      setButtonColor2('bg-sky-600');
    }
  }
  const handlePlay = async () => {
    if (userId === '') {
      toast('Please input UserID', { hideProgressBar: false, autoClose: 2000, type: 'error' });
    } else if (amount === 0) {
      toast('Please input Amount', { hideProgressBar: false, autoClose: 2000, type: 'error' });
    } else if (target === 0) {
      toast('Please input Dividing', { hideProgressBar: false, autoClose: 2000, type: 'error' });
    } else if (userToken === '') {
      toast('Please input userToken', { hideProgressBar: false, autoClose: 2000, type: 'error' });
    } else {
      let count = 0;
      if (socketRef.current) {
        setTimeout(() => {
          socketRef.current.send(
            JSON.stringify({
              id: '0d7d8090-9791-11ee-b9d1-0242ac120002',
              payload: {
                query:
                  '{\n  authenticate(\n    authToken: \n"' +
                  userToken +
                  '"\n  ) {\n    _id\n    username\n    authToken\n    email\n    twoFactorEnabled\n    role\n    countryBlock\n    __typename\n  }\n}',
                variables: {}
              },
              type: 'subscribe'
            })
          );
        }, 1000);

        setTimeout(() => {
          const interval = setInterval(() => {
            count++;
            socketRef.current.send(
              JSON.stringify({
                id: 'b37aeb93-b24a-41c4-8ac6-c8a496d99f88',
                payload: {
                  query:
                  "mutation ($amount: Float!, $clientSeed: String!, $targetMultiplier: Float!) {\n  playTarget(\n    amount: $amount\n    clientSeed: $clientSeed\n    targetMultiplier: $targetMultiplier\n  ) {\n    id\n    isWin\n    profit\n    details {\n      ... on DiceGameDetails {\n        __typename\n      }\n      ... on TargetGameDetails {\n        __typename\n        result\n      }\n      ... on MinesGameDetails {\n        __typename\n      }\n      ... on TowerGameDetails {\n        __typename\n      }\n      ... on HiloGameDetails {\n        __typename\n      }\n      __typename\n    }\n    __typename\n  }\n}",
                  variables: { targetMultiplier: parseInt(target), amount: parseInt(amount), clientSeed: userId }
                },
                type: 'subscribe'
              })
            );
            if (count >= playNumber) {
              clearInterval(interval);
            }
          }, 40);
        }, 2000);
      }
    }
  };

  function handleChangeUserToken(event) {
    setUserToken(event.target.value);
  }

  // let socket;

  useEffect(() => {
    socketRef.current = new WebSocket('wss://bch.games/api/graphql', 'graphql-transport-ws');

    socketRef.current.onopen = () => {
      // Once the WebSocket connection is open, you can send your GraphQL request
      socketRef.current.send(JSON.stringify({ type: 'connection_init' }));
    };

    socketRef.current.onmessage = (event) => {
      // Handle incoming messages from the WebSocket server
      const response = JSON.parse(event.data);
      if (response.id === '0d7d8090-9791-11ee-b9d1-0242ac120002' && response.payload) {
        username = response.payload.data.authenticate.username;
      } else if (response.id === 'b37aeb93-b24a-41c4-8ac6-c8a496d99f88' && response.payload) {
        if (response.payload.errors && response.payload.errors[0].message === 'INSUFFICIENT_FUNDS_ERROR')
          toast('Not enough BCH', { hideProgressBar: false, autoClose: 2000, type: 'error' });
        else if (response.payload.data.playTarget) {
          setPlayData((prevPlayData) => [...prevPlayData, { username: username, data: response.payload.data.playTarget }]);
        }
      } else {
        console.log('response =>', response.id);
      }
    };
    return () => {
      // Clean up the WebSocket connection when the component is unmounted
      if (socketRef.current) {
        socketRef.current.close();
      }
    };
  }, []);

  return (
    <div className="w-screen">
      <div className="inline-flex mb-3">
        <div className="flex items-center justify-center mr-[70px]">
          <div className="text-[20px]">UserId</div>
        </div>
        <input
          className="items-center text-sm leading-6 text-black rounded-md ring-1 shadow-sm py-1.5 pl-2 pr-3 hover:ring-white bg-gray-300 dark:highlight-white/5 dark:hover:bg-gray-100"
          onChange={handleChangeUserId}
        ></input>
      </div>

      <div className="inline-flex w-full mb-3">
        <div className="flex items-center justify-center mr-[32px]">
          <div className="text-[20px]">UserToken</div>
        </div>
        <input
          className="items-center text-sm leading-6 text-black rounded-md ring-1 shadow-sm py-1.5 pl-2 pr-3 hover:ring-white bg-gray-300 dark:highlight-white/5 dark:hover:bg-gray-100"
          onChange={handleChangeUserToken}
        ></input>
      </div>

      <div className="inline-flex w-full mb-5">
        <div className="flex items-center mr-[58px]">
          <div className="text-[20px]">Amount</div>
        </div>
        <input
          className="items-center text-sm leading-6 text-black rounded-md ring-1 shadow-sm py-1.5 pl-2 pr-3 hover:ring-white bg-gray-300 dark:highlight-white/5 dark:hover:bg-gray-100"
          onChange={handleChangeAmount}
        ></input>
      </div>

      <div className="inline-flex w-full mb-5">
        <div className="flex items-center mr-[11px]">
          <div className="text-[20px]">Play Number</div>
        </div>
        <input
          className="items-center text-sm leading-6 text-black rounded-md ring-1 shadow-sm py-1.5 pl-2 pr-3 hover:ring-white bg-gray-300 dark:highlight-white/5 dark:hover:bg-gray-100"
          onChange={handleChangePlayNumber}
        ></input>
      </div>

      <div className="inline-flex w-full mb-5">
        <div className="flex items-center mr-[20px]">
          <div className="text-[20px]">Target</div>
        </div>
        <input
          className="items-center text-sm leading-6 text-black rounded-md ring-1 shadow-sm py-1.5 pl-2 pr-3 hover:ring-white bg-gray-300 dark:highlight-white/5 dark:hover:bg-gray-100"
          onChange={handleChangeTarget}
        ></input>
        <button
          className={`rounded-full bg-gray-300 hover:bg-gray-500 ml-3`}
          onClick={() => {
            handlePlay();
          }}
        >
          <div className="mx-[20px]">Play</div>
        </button>
      </div>
      {playData.length != 0 ? (
        <>
          <div className="table text-[15px] max-w-xs w-full">
            <div className="table-header-group">
              <div className="table-row">
                <div className="table-cell text-left">No</div>
                <div className="table-cell text-left">User</div>
                <div className="table-cell text-left">Profit</div>
                <div className="table-cell text-left">Result</div>
              </div>
            </div>

            <div className="table-row-group">
              {playData.map((item, index) => (
                <div className="table-row" key={index}>
                  <div className="table-cell">{index + 1}</div>
                  <div className="table-cell">{item.username}</div>
                  <div className="table-cell">{item.data.profit}</div>
                  <div className="table-cell">{item.data.details.result}</div>
                </div>
              ))}
            </div>
          </div>
        </>
      ) : null}

      <ToastContainer />
    </div>
  );
};

export default Target;
