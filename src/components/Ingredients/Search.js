import React, {useState, useEffect, useRef} from 'react';

import Card from '../UI/Card';
import ErrorModal from '../UI/ErrorModal';
import useHttp from '../../hooks/http';
import './Search.css';

const Search = React.memo(props => {
  const {onLoadIngredients} = props;
  const [enteredFilter, setEnteredFilter] = useState('');
  const searchRef = useRef();
  const {isLoading, data, error, sendRequest, clear} = useHttp();

/*
  Return clean up function for UseEffect it runs right before this same useEffect() runs next time
  Having [] as dependency, the cleanup function runs when the component gets unmounted
  The return statement has to be always a function.
*/ 
  useEffect(() => {
    const timer = setTimeout(() => {
      if(enteredFilter === searchRef.current.value){
        const queryParams = enteredFilter.length === 0 ? '' : `?orderBy="title"&equalTo="${enteredFilter}"`;

        sendRequest("https://react-hooks-update-b7863-default-rtdb.firebaseio.com/ingredients.json" + queryParams, 'GET');
      }  
    }, 500);    
    return () => {
      clearTimeout(timer);
    };   
  },[enteredFilter, searchRef, sendRequest]);

  useEffect(() => {
    if(!isLoading && !error && data){
      const loadedIngredientes = [];
      for(const key in data){
        loadedIngredientes.push({
          id: key,
          title: data[key].title,
          amount: data[key].amount
        });
      }
    onLoadIngredients(loadedIngredientes);
    }
  }, [data, isLoading, error, onLoadIngredients]);

  return (
    <section className="search">
      {error && <ErrorModal onClose={clear}>{error}</ErrorModal>}
      <Card>
        <div className="search-input">
          <label>Filter by Title</label>
          {isLoading && <span>Loading...</span>}
          <input type="text" value={enteredFilter} onChange={event => setEnteredFilter(event.target.value)} ref={searchRef}/>
        </div>
      </Card>
    </section>
  );
});

export default Search;
