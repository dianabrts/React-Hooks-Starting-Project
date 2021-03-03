import React, {useReducer, useEffect, useCallback, useMemo} from 'react';
import IngredientForm from './IngredientForm';
import IngredientList from './IngredientList';
import Search from './Search';
import ErrorModal from '../UI/ErrorModal';
import useHttp from '../../hooks/http';

/*
  By default UseEffect gets executed AFTER every component render cycle
  Used like this, useEffect() acts like componentDidUpdate, it runs the function AFTER EVERY component update (re-render)
  UseEffect requires 2 arguments, the second one contains an array of the Dependencies, omiting this second argument is not an option
  Adding an empty array [] as a second argument, useEffect() acts like componentDidMount, it runs ONLY ONCE (after the first render)
  UseEffect can be used as me times needed
  Omitting the second arguments leads to run that UseEffect() for every re-render cycle
  Especifying it ensures that only runs when the dependency changes 
*/

//useReducer has absolutely NO connection with Redux library
//Reducer function takes two arguments which are state and action
const ingredientReducer = (currentIngredients, action) => {
  switch(action.type){
    case 'SET_INGREDIENT': return action.ingredients;
    case 'ADD_INGREDIENT': return [...currentIngredients, action.ingredient];
    case 'DELETE_INGREDIENT': return currentIngredients.filter(ing => ing.id !== action.id);
    default: throw new Error('Should not get here!');
  }
};

const Ingredients = () => {
  const [userIngredients, dispatch] = useReducer(ingredientReducer, []);
  const {isLoading, error, data, sendRequest, reqExtra, reqIdentifier, clear} = useHttp();

  useEffect(() => {
    if(!isLoading && !error && reqIdentifier === 'REMOVE_INGREDIENT_REQ'){
      dispatch({type: 'DELETE_INGREDIENT', id: reqExtra});
    }
    else if (!isLoading && !error && reqIdentifier === 'ADD_INGREDIENT_REQ'){
      dispatch({
        type: 'ADD_INGREDIENT',
        ingredient: {id: data.name, ...reqExtra}
      });
    }
  },[data, reqExtra, reqIdentifier, isLoading, error]);

const addIngredientHandler = useCallback( (ingredient) => {
  sendRequest('https://react-hooks-update-b7863-default-rtdb.firebaseio.com/ingredients.json',
    'POST', 
    JSON.stringify(ingredient),
    ingredient,
    'ADD_INGREDIENT_REQ'
    );     
}, [sendRequest]);

const filteredIngredientsHanlder = useCallback(filteredIngredientes => {
  dispatch({type: 'SET_INGREDIENT', ingredients: filteredIngredientes});
}, []);

const removeIngredientHandler = useCallback((ingredientId) => {  
  sendRequest(`https://react-hooks-update-b7863-default-rtdb.firebaseio.com/ingredients/${ingredientId}.json`,
    'DELETE', 
    null, 
    ingredientId,
    'REMOVE_INGREDIENT_REQ')     
},[sendRequest]);

const ingredientList = useMemo(() => {
  return (
    <IngredientList ingredients={userIngredients} onRemoveItem={removeIngredientHandler}></IngredientList>);
}, [userIngredients, removeIngredientHandler]);

return (
  <div className="App">
    {error && <ErrorModal onClose={clear}>{error}</ErrorModal>}
    <IngredientForm onAddIngredient={addIngredientHandler} loading={isLoading}/>
    <section>
      <Search onLoadIngredients={filteredIngredientsHanlder}/>
      {ingredientList}
    </section>
  </div>
  );
};

export default Ingredients;