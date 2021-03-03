import {useReducer, useCallback} from 'react';

const initialState = {
    loading: false, 
    error: null,
    data: null,
    extra: null,
    identifier: null
};

const httpReducer = (currentHttpState, action) => {
    switch(action.type){
        case 'SEND_REQUEST': return {loading: true, error: null, data: null, extra: null, identifier: action.identifier};
        case 'RESPONSE': return {...currentHttpState, loading: false, data: action.responseData, extra: action.extra};
        case 'ERROR': return {loading: false, errorMessage: action.errorMessage};
        case 'CLEAR': return initialState;
        default: throw new Error('Should not get here!');
    };
};

//Custom hooks runs every re-render cycle, the hook will get call whenever the component where the hook is being used re-executes
const useHttp = () => {
    const [httpState, disaptchHttp] = useReducer(httpReducer, initialState);

    const clear = useCallback(() => disaptchHttp({type: 'CLEAR'}), []);

    const sendRequest = useCallback((url,method, body, reqExtra, reqIdentifier) => {
        disaptchHttp({type: 'SEND_REQUEST', identifier: reqIdentifier});
        fetch(
            url, {
                method: method,
                body: body,
                headers:{
                    'Content-Type': 'application/json'
                }
            }
        ).then(response => {
            return response.json();
        })
        .then(responseData => {
            disaptchHttp({type: 'RESPONSE', responseData: responseData, extra: reqExtra}); 
        })
        .catch(error => {
            disaptchHttp({type: 'ERROR', errorMessage: "Something went wrong!"});
        });
    }, []);

    return {
        isLoading: httpState.loading,
        data: httpState.data,
        error: httpState.error,
        sendRequest: sendRequest,
        reqExtra: httpState.extra,
        reqIdentifier: httpState.identifier,
        clear: clear
    };
};

export default useHttp;