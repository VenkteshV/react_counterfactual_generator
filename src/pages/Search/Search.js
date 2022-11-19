import React, { useEffect, useState } from 'react';
import axios from 'axios';
import CircularProgress  from '@material-ui/core/CircularProgress';
import { useLocation, useHistory } from "react-router-dom";

import Results from '../../components/Results/Results';
import Pager from '../../components/Pager/Pager';
import Facets from '../../components/Facets/Facets';
import SearchBar from '../../components/SearchBar/SearchBar';

import "./Search.css";

export default function Search() {
  
  let location = useLocation();
  let history = useHistory();
  
  const [ results, setResults ] = useState([]);
  const [ resultCount, setResultCount ] = useState(0);
  const [ currentPage, setCurrentPage ] = useState(1);
  const [ q, setQ ] = useState(new URLSearchParams(location.search).get('q') ?? "*");
  const [ top ] = useState(new URLSearchParams(location.search).get('top') ?? 8);
  const [ skip, setSkip ] = useState(new URLSearchParams(location.search).get('skip') ?? 0);
  const [ filters, setFilters ] = useState([]);
  const [ facets, setFacets ] = useState({});
  const [ isLoading, setIsLoading ] = useState(true);

  let resultsPerPage = top;
  
  useEffect(() => {
    setIsLoading(true);
    const body = {
      content: q
    };

    axios.post( 'http://localhost:8000/paraphrase', {content:q}, {headers: { "Content-Type": "application/json" }})
        .then( response => {
            setResults(response);
            setResultCount(response.data.length);
            setIsLoading(false);
        } )
        .catch(error => {
            console.log(error);
            setIsLoading(false);
        });
    
  }, [q, top, skip, filters]);


  let postSearchHandler = (searchTerm) => {
    // pushing the new search term to history when q is updated
    // allows the back button to work as expected when coming back from the details page
    history.push('/search?q=' + searchTerm);  
    setCurrentPage(1);
    setSkip(0);
    setFilters([]);
    setQ(searchTerm);
  }

  let updatePagination = (newPageNumber) => {
    setCurrentPage(newPageNumber);
    setSkip((newPageNumber-1) * top);
  }

  var body;
  if (isLoading) {
    body = (
      <div className="col-md-9">
        <CircularProgress />
      </div>);
  } else {
    body = (
      <div className="col-md-9">
        <Results documents={results.data} top={top} skip={skip} count={resultCount}></Results>
        <Pager className="pager-style" currentPage={currentPage} resultCount={resultCount} resultsPerPage={resultsPerPage} setCurrentPage={updatePagination}></Pager>
      </div>
    )
  }

  return (
    <main className="main main--search container-fluid">
      
      <div className="row">
        <div className="col-md-3">
          <div className="search-bar">
            <SearchBar postSearchHandler={postSearchHandler} q={q}></SearchBar>
          </div>
          <Facets facets={facets} filters={filters} setFilters={setFilters}></Facets>
        </div>
        {body}
      </div>
    </main>
  );
}
