import React, { useState, useEffect, useRef } from 'react';
import { toast } from 'react-toastify';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
const Hilo = () => {
  const [userId, setUserID] = useState('');
  const [amount, setAmount] = useState(0);
  const [buttonColor1, setButtonColor1] = useState('bg-sky-600');
  const [buttonColor2, setButtonColor2] = useState('bg-gray-300');
  const [playNumber, setPlayNumber] = useState(1);
  const [userToken, setUserToken] = useState('');
  const socketRef = useRef(null);
  const [playData, setPlayData] = useState([]);
  let username = '';
  let playId = '';
  let counter = 0;
  let selectArray = ['HigherOrSame', 'LowerOrSame'];
  const playNumberRef = useRef(1);
  const userIdRef = useRef('');
  const amountRef = useRef(0);

  function handleChangeUserId(event) {
    setUserID(event.target.value);
  }
  function handleChangeAmount(event) {
    setAmount(event.target.value);
  }
  function handleChangePlayNumber(event) {
    setPlayNumber(parseInt(event.target.value));
  }
  const handlePlay = async () => {
    if (userId === '') {
      toast('Please input UserID', { hideProgressBar: false, autoClose: 2000, type: 'error' });
    } else if (amount === 0) {
      toast('Please input Amount', { hideProgressBar: false, autoClose: 2000, type: 'error' });
    } else if (userToken === '') {
      toast('Please input userToken', { hideProgressBar: false, autoClose: 2000, type: 'error' });
    } else {
      counter = 0;
      if (socketRef.current) {
        setTimeout(() => {
          socketRef.current.send(
            JSON.stringify({
              id: '2302f5fa-98c0-11ee-b9d1-0242ac120002',
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
          socketRef.current.send(
            JSON.stringify({
              id: '134fa1dd-86c9-4bd4-ae31-2b8d0db16d98',
              payload: {
                query:
                  'mutation ($amount: Float!, $card: String!, $clientSeed: String!) {\n  playHilo(amount: $amount, card: $card, clientSeed: $clientSeed) {\n    _id\n    amount\n    details {\n      ... on HiloGameDetails {\n        __typename\n        cards\n        picks\n      }\n      ... on MinesGameDetails {\n        __typename\n      }\n      ... on DiceGameDetails {\n        __typename\n      }\n      ... on TargetGameDetails {\n        __typename\n      }\n      ... on TowerGameDetails {\n        __typename\n      }\n      __typename\n    }\n    __typename\n  }\n}',
                variables: { card: '♦K', amount: parseInt(amount), clientSeed: userId }
              },
              type: 'subscribe'
            })
          );
        }, 2000);
      }
    }
  };

  function handleChangeUserToken(event) {
    setUserToken(event.target.value);
  }
  const autoPlay = (data) => {
    console.log('data---->', data._id);
    socketRef.current.send(
      JSON.stringify({
        id: '9dafaba2-98c7-11ee-b9d1-0242ac120002',
        payload: {
          query:
            'mutation ($_id: ID!, $pick: HiloGamePick!) {\n  hiloPick(_id: $_id, pick: $pick) {\n    __typename\n    ... on SinglePlayerGameBet {\n      id\n      isWin\n      multiplier\n      profit\n      amount\n      details {\n        ... on HiloGameDetails {\n          __typename\n          cards\n          picks\n        }\n        ... on MinesGameDetails {\n          __typename\n        }\n        ... on DiceGameDetails {\n          __typename\n        }\n        ... on TargetGameDetails {\n          __typename\n        }\n        ... on TowerGameDetails {\n          __typename\n        }\n        __typename\n      }\n      __typename\n    }\n    ... on SinglePlayerGameBetInProgress {\n      _id\n      amount\n      details {\n        ... on HiloGameDetails {\n          __typename\n          cards\n          picks\n        }\n        ... on MinesGameDetails {\n          __typename\n        }\n        ... on DiceGameDetails {\n          __typename\n        }\n        ... on TargetGameDetails {\n          __typename\n        }\n        ... on TowerGameDetails {\n          __typename\n        }\n        __typename\n      }\n      __typename\n    }\n  }\n}',
          variables: { pick: data.pick, _id: data.playId }
        },
        type: 'subscribe'
      })
    );
  };

  const miniPlay = () => {
      setTimeout(() => {
        socketRef.current.send(
          JSON.stringify({
            id: '134fa1dd-86c9-4bd4-ae31-2b8d0db16d98',
            payload: {
              query:
                'mutation ($amount: Float!, $card: String!, $clientSeed: String!) {\n  playHilo(amount: $amount, card: $card, clientSeed: $clientSeed) {\n    _id\n    amount\n    details {\n      ... on HiloGameDetails {\n        __typename\n        cards\n        picks\n      }\n      ... on MinesGameDetails {\n        __typename\n      }\n      ... on DiceGameDetails {\n        __typename\n      }\n      ... on TargetGameDetails {\n        __typename\n      }\n      ... on TowerGameDetails {\n        __typename\n      }\n      __typename\n    }\n    __typename\n  }\n}',
              variables: { card: '♠K', amount: parseInt(amountRef.current), clientSeed: userIdRef.current }
            },
            type: 'subscribe'
          })
        );
      }, 500);
      counter++;
  };
  const getString = (array) => {
    let string = '';
    for (let i = 0; i < array.length; i++) {
      string = string + array[i] + ',';
    }
    return string;
  };
  const withdrow = (play_id) => {
    setTimeout(() => {
      socketRef.current.send(
        JSON.stringify({
          id: 'fe8f2dbe-e253-436a-b06d-c60cee770fcf',
          payload: {
            query:
              'mutation ($_id: ID!) {\n  hiloCashout(_id: $_id) {\n    id\n    isWin\n    multiplier\n    profit\n    amount\n    details {\n      ... on HiloGameDetails {\n        __typename\n        cards\n        picks\n      }\n      ... on MinesGameDetails {\n        __typename\n      }\n      ... on DiceGameDetails {\n        __typename\n      }\n      ... on TargetGameDetails {\n        __typename\n      }\n      ... on TowerGameDetails {\n        __typename\n      }\n      __typename\n    }\n    __typename\n  }\n}',
            variables: { _id: play_id }
          },
          type: 'subscribe'
        })
      );
    }, 500);
  };

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
      if (response.id === '2302f5fa-98c0-11ee-b9d1-0242ac120002' && response.payload) {
        username = response.payload.data.authenticate.username;
      } else if (response.id === '134fa1dd-86c9-4bd4-ae31-2b8d0db16d98' && response.payload) {
        if (response.payload.errors && response.payload.errors[0].message === 'INSUFFICIENT_FUNDS_ERROR')
          toast('Not enough BCH', { hideProgressBar: false, autoClose: 2000, type: 'error' });
        else if (response.payload.data) {
          console.log('====================>', response.payload.data);
          playId = response.payload.data.playHilo._id;
          autoPlay({ playId: playId, pick: 'LowerOrSame' });
        }
      } else if (response.id === '9dafaba2-98c7-11ee-b9d1-0242ac120002' && response.payload) {
        console.log('-------->', response.payload);
        withdrow(playId);
      } else if (response.id === 'fe8f2dbe-e253-436a-b06d-c60cee770fcf' && response.payload) {
        if (response.payload.errors) {
          setTimeout(() => {
            miniPlay();
          }, 2000);
        } else {
          setPlayData((prevPlayData) => [...prevPlayData, { username: username, data: response.payload.data.hiloCashout }]);
          miniPlay();
        }
      } else {
        console.log('response =>', response);
      }
    };
    return () => {
      // Clean up the WebSocket connection when the component is unmounted
      if (socketRef.current) {
        socketRef.current.close();
      }
    };
  }, []);

  useEffect(() => {
    playNumberRef.current = playNumber;
    userIdRef.current = userId;
    amountRef.current = amount;
  }, [playNumber, amount, userId]);

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
        <div className="flex items-center mr-[28px]">
          <div className="text-[20px]">Play Number</div>
        </div>
        <input
          className="items-center text-sm leading-6 text-black rounded-md ring-1 shadow-sm py-1.5 pl-2 pr-3 hover:ring-white bg-gray-300 dark:highlight-white/5 dark:hover:bg-gray-100"
          onChange={handleChangePlayNumber}
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
          <div className="table text-[15px] w-full">
            <div className="table-header-group">
              <div className="table-row">
                <div className="table-cell text-left">No</div>
                <div className="table-cell text-left">User</div>
                <div className="table-cell text-left">Amount</div>
                <div className="table-cell text-left">Cards</div>
                <div className="table-cell text-left">Picks</div>
                <div className="table-cell text-left">Id</div>
                <div className="table-cell text-left">Multiplier</div>
                <div className="table-cell text-left">Profit</div>
              </div>
            </div>

            <div className="table-row-group">
              {playData.map((item, index) => (
                <div className="table-row" key={index}>
                  <div className="table-cell">{index + 1}</div>
                  <div className="table-cell">{item.username}</div>
                  <div className="table-cell">{item.data.amount}</div>
                  <div className="table-cell">{getString(item.data.details.cards)}</div>
                  <div className="table-cell">{getString(item.data.details.picks)}</div>
                  <div className="table-cell">{item.data.id}</div>
                  <div className="table-cell">{item.data.multiplier}</div>
                  <div className="table-cell">{item.data.profit}</div>
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

export default Hilo;
