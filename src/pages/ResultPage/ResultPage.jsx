import React from 'react';
import { useState, useEffect } from 'react';

import './ResultPage.style.css';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import BookCard from '../../components/ResultPage/BookCard';
import Dropdown from 'react-bootstrap/Dropdown';
import DropdownButton from 'react-bootstrap/DropdownButton';

import axios from 'axios';
import { useSearchParams } from 'react-router-dom';

const displayOptions = [
  { displayName: '10개', apiName: 10 },
  { displayName: '20개', apiName: 20 },
  { displayName: '30개', apiName: 30 }
];

const sortOptions = [
  { displayName: '관련도', apiName: 'Accuracy' },
  { displayName: '출간일', apiName: 'PublishTime' },
  { displayName: '제목', apiName: 'Title' },
  { displayName: '판매량', apiName: 'SalesPoint' },
  { displayName: '고객평점', apiName: 'CustomerRating' },
  { displayName: '마이리뷰갯수', apiName: 'MyReviewCount' }
];

export default function ResultPage() {
  const [query, setQuery] = useSearchParams();
  const [sortOption, setSortOption] = useState('Accuracy');
  const [data, setData] = useState({});
  const [page, setPage] = useState(1);
  const [start, setStart] = useState(2);
  const [end, setEnd] = useState(7);
  const [selectedItem, setSelectedItem] = useState(displayOptions[0]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleItemClick = (item) => {
    setSelectedItem(item);
  };

  const keyword = query.get('q');

  const TTBKey = 'ttbjjari910105001';

  const getBookInfo = async () => {
    setIsLoading(true);
    setError(null);

    axios
      .get(
        `/ttb/api/ItemSearch.aspx?ttbkey=${TTBKey}&Query=${keyword}&QueryType=Keyword&Output=JS&MaxResults=${selectedItem.apiName}&Cover=Big&Start=${page}&Version=20131101&Sort=${sortOption}`
      )
      .then((res) => {
        setData(res.data);
      })
      .catch((error) => {
        setError(error);
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  useEffect(() => {
    setSortOption('Accuracy');
    setPage(1);
    getBookInfo();
  }, [keyword]);

  useEffect(() => {
    setPage(1);
    getBookInfo();
  }, [sortOption]);

  useEffect(() => {
    getBookInfo();
  }, [page]);

  useEffect(() => {
    setPage(1);
    getBookInfo();
  }, [selectedItem]);

  console.log('ResultPage ', data);

  const handlePageChange = (pageNumber) => {
    console.log(pageNumber);
    setPage(pageNumber);
  };

  const handleNextPage = () => {
    if (end === Math.floor(data.totalResults / data.itemsPerPage)) {
      return;
    } else {
      setPage(start + 6);
      setStart(start + 6);
      setEnd(end + 6);
    }
  };

  const handlePrevPage = () => {
    if (start === 2) {
      return;
    } else {
      setPage(start - 6);
      setStart(start - 6);
      setEnd(end - 6);
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  return (
    <div className='text'>
      <div className='searchCount'>
        <h4>
          <span className='searchQuery'>{data && data.query}</span> 검색 결과: 총{' '}
          {data && data.totalResults && data.totalResults.toLocaleString()}건
        </h4>
      </div>
      <div className='sortArea'>
        <ul className='sortItems'>
          {sortOptions.map((item, index) => (
            <li
              className={`sortItem ${index === 0 ? 'active' : ''}`}
              onClick={(event) => {
                const sortItems = document.querySelectorAll('.sortItem');
                sortItems.forEach((element, idx) => {
                  if (idx === index) {
                    element.classList.add('active');
                  } else {
                    element.classList.remove('active');
                  }
                });
                console.log(item.apiName);
                setSortOption(item.apiName);
              }}
              key={item.apiName}>
              {item.displayName}
            </li>
          ))}
        </ul>
        <DropdownButton variant='outline-primary' id='dropdown-basic-button' title={selectedItem.displayName}>
          {displayOptions.map((option) => (
            <Dropdown.Item key={option.apiName} onClick={() => handleItemClick(option)}>
              {option.displayName}
            </Dropdown.Item>
          ))}
        </DropdownButton>
      </div>
      <div>
        <Row>
          {data.item &&
            data.item.map((item, index) => (
              <Col key={index} lg={6} sm={12} className='bookCard'>
                <BookCard book={item} />
              </Col>
            ))}
        </Row>
      </div>
      <div className='pagenationArea'>
        <span className='pageMove' onClick={() => handlePrevPage()}>
          &#60;
        </span>
        <span className={page === 1 ? 'pageActive' : ''} onClick={() => handlePageChange(1)}>
          {1}
        </span>
        {start !== 2 && <span>...</span>}
        {Array.from({ length: end - start + 1 }, (_, i) => {
          const pageNumber = start + i;
          return (
            <span
              key={pageNumber}
              className={pageNumber === data.startIndex ? 'pageActive' : ''}
              onClick={() => handlePageChange(pageNumber)}>
              {pageNumber}
            </span>
          );
        })}
        {end !== Math.ceil(data.totalResults / data.itemsPerPage) && <span>...</span>}
        <span onClick={() => handlePageChange(Math.ceil(data.totalResults / data.itemsPerPage))}>
          {Math.ceil(data.totalResults / data.itemsPerPage)}
        </span>
        <span className='pageMove' onClick={() => handleNextPage()}>
          &#62;
        </span>
      </div>
      <div className='space'></div>
    </div>
  );
}
