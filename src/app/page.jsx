"use client";
import React, { useState, useDeferredValue, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { usePagination } from "@mantine/hooks";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ChevronUp, ChevronDown } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
const Pagination = () => {
  const [page, setPage] = useState(0);
  const [searchValue, setSearchValue] = useState("");
  const deferredValue = useDeferredValue(searchValue);
  const debouncedValue = useDebouncedValue(deferredValue, 1000);
  const [sortDataByDate, setSortDataByDate] = useState(true);
  const [sortDataByTime, setSortDataByTime] = useState(true);
  const [finalData, setFinalData] = useState();
  const pagination = usePagination({ total: 40, initialPage: 1 });

  useEffect(() => {
    const sortedArray = finalData?.sort((Person1, Person2) => {
      return sortDataByDate
        ? new Date(Person1.Date) - new Date(Person2.Date)
        : new Date(Person2.Date) - new Date(Person1.Date);
    });

    setFinalData(sortedArray);
  }, [sortDataByDate, page]);

  useEffect(() => {
    const sortedArray = finalData?.sort((Person1, Person2) => {
      return sortDataByTime
        ? Person1.Time.localeCompare(Person2.Time)
        : Person2.Time.localeCompare(Person1.Time);
    });
    setFinalData(sortedArray);
  }, [sortDataByTime, page]);

  // useEffect(() => {}, [sortDataByTime]);

  const handleSearch = async (debouncedValue, page) => {
    const res = await fetch(`/api/search?page=${page}`, {
      method: "POST",
      body: JSON.stringify({
        queryValue: debouncedValue,
      }),
    });
    return res.json();
  };

  const fetchUsers = async (page) => {
    if (searchValue == "") {
      const res = await fetch(`/api/paginate?page=${page}`);
      return res.json();
    }
    return { noResults: true };
  };

  const transFormDate = (dateWithTimeStamp) => {
    const dateTime = new Date(dateWithTimeStamp);
    const date = dateTime.toISOString().split("T")[0];
    const time = dateTime.toISOString().split("T")[1].slice(0, -1);
    return { date, time };
  };

  const transformData = ({ data, hasComeToEnd }) => {
    const transformedData = data?.map((customer) => {
      return {
        sno: customer.sno,
        customer_name: customer.customer_name,
        age: customer.age,
        phone: customer.phone,
        location: customer.location,
        Date: transFormDate(customer.created_at).date,
        Time: transFormDate(customer.created_at).time,
      };
    });

    return { transformedData, hasComeToEnd };
  };

  const {
    isLoading,
    isError,
    error,
    data: initialData,
    isFetching,
    isFetched: initalFetched,
  } = useQuery({
    queryFn: () => fetchUsers(page),
    queryKey: [page],
    select: transformData,
  });
  const {
    data: searchData,
    error: searchError,
    isFetched: searchFetched,
  } = useQuery({
    queryFn: () => handleSearch(debouncedValue, page),
    queryKey: [debouncedValue, page],
    retry: false,
    select: transformData,
  });
  useEffect(() => {
    setFinalData(initialData?.transformedData);
  }, [initalFetched]);
  useEffect(() => {
    setFinalData(searchData?.transformedData);
  }, [searchFetched]);

  if (isLoading) {
    return <h2>Loading...</h2>;
  }

  if (isError || searchError) {
    return (
      <h2>
        {error?.message}
        {searchError?.message}
      </h2>
    );
  }

  return (
    <div>
      <Table className="overflow-scroll">
        <TableCaption>A list of your recent invoices.</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[100px]">S.No</TableHead>
            <TableHead>Customer Name</TableHead>
            <TableHead>Age</TableHead>
            <TableHead>Phone</TableHead>
            <TableHead>Location</TableHead>
            <TableHead
              className="relative"
              onClick={() => {
                setSortDataByDate((prev) => !prev);
              }}
            >
              Date
              <span className="absolute left-20">
                {sortDataByDate ? (
                  <ChevronDown size={20} />
                ) : (
                  <ChevronUp size={20} />
                )}
              </span>
            </TableHead>
            <TableHead
              className="relative"
              onClick={() => {
                setSortDataByTime((prev) => !prev);
              }}
            >
              Time
              <span className="absolute left-20">
                {sortDataByTime ? (
                  <ChevronDown size={20} />
                ) : (
                  <ChevronUp size={20} />
                )}
              </span>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {searchValue == "" &&
            finalData &&
            finalData?.map((Person) => {
              return (
                <TableRow key={Person.sno}>
                  <TableCell>{Person.sno}</TableCell>
                  <TableCell>{Person.customer_name}</TableCell>
                  <TableCell>{Person.age}</TableCell>
                  <TableCell>{Person.phone}</TableCell>
                  <TableCell>{Person.location}</TableCell>
                  <TableCell>{Person.Date}</TableCell>
                  <TableCell>{Person.Time}</TableCell>
                </TableRow>
              );
            })}
          {searchValue != "" &&
            finalData &&
            finalData?.map((Person) => {
              return (
                <TableRow key={Person.sno}>
                  <TableCell>{Person.sno}</TableCell>
                  <TableCell>{Person.customer_name}</TableCell>
                  <TableCell>{Person.age}</TableCell>
                  <TableCell>{Person.phone}</TableCell>
                  <TableCell>{Person.location}</TableCell>
                  <TableCell>{Person.Date}</TableCell>
                  <TableCell>{Person.Time}</TableCell>
                </TableRow>
              );
            })}
        </TableBody>
      </Table>
      <h2>Paginated View</h2>
      <h1>{page + 1}</h1>
      {searchValue == "" && initialData && JSON.stringify(initialData)}
      {searchValue != "" && searchData && JSON.stringify(searchData)}
      <div className="nav btn-container">
        <Button
          onClick={() => setPage((prevState) => Math.max(prevState - 1, 0))}
          disabled={page === 0}
        >
          Previous
        </Button>

        <Button
          onClick={() => setPage((prevState) => prevState + 1)}
          disabled={initialData?.hasComeToEnd || searchData?.hasComeToEnd}
        >
          Next
        </Button>
      </div>
      <div>{isFetching ? "Fetching..." : null}</div>
      <Input
        type="text"
        onChange={(e) => {
          setSearchValue(e.target.value);
        }}
        value={searchValue}
      />
    </div>
  );
};

export default Pagination;
