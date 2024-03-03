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
import { ROWS_PER_PAGE } from "@/constants/constant";
import { ChevronDown } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const PaginationPage = () => {
  const [page, setPage] = useState(1);
  const [searchValue, setSearchValue] = useState("");
  const deferredValue = useDeferredValue(searchValue);
  const debouncedValue = useDebouncedValue(deferredValue, 1000);

  /**
   *  To check whether user wants to sort by date or time
   *
   */
  const [sortDataByDate, setSortDataByDate] = useState(true);
  const [sortDataByTime, setSortDataByTime] = useState(true);

  /**
   *   The data may be obtained from search or initally loaded ones so that we will be storing it in
   *    final data
   *
   */
  const [finalData, setFinalData] = useState();

  /**
   *   page counts based on the rows of the data
   */
  const [pageCount, setPageCount] = useState(2);

  /**
   *  usePagination hook from mantine
   *
   */
  const pagination = usePagination({
    total: pageCount,
    page: page,
    onChange: setPage,
  });

  /**
   *  when ever page changes or sorting changes this effects will be running
   *
   */
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

  /**
   *  This will run when user searchs by text
   *
   */
  const handleSearch = async (debouncedValue, page) => {
    const res = await fetch(`/api/search?page=${page}`, {
      method: "POST",
      body: JSON.stringify({
        queryValue: debouncedValue,
      }),
    });
    return res.json();
  };

  /**
   *
   * This will run at initial load
   *
   */

  const fetchUsers = async (page) => {
    if (searchValue == "") {
      const res = await fetch(`/api/paginate?page=${page}`);
      return res.json();
    }
    return { noResults: true };
  };

  /**
   *  for separating the date and time
   */

  const transFormDate = (dateWithTimeStamp) => {
    const dateTime = new Date(dateWithTimeStamp);
    const date = dateTime.toISOString().split("T")[0];
    const time = dateTime.toISOString().split("T")[1].slice(0, -1);
    return { date, time };
  };

  const transformData = ({ data, hasComeToEnd, count }) => {
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

    return { transformedData, hasComeToEnd, count };
  };

  /**
   *  using react query for fetching the data or for searching the data
   *
   */
  const {
    isLoading: initialLoading,
    isError,
    error,
    data: initialData,
    isFetching,
    isFetched: initalFetched,
  } = useQuery({
    /**
     *
     * query function runs when page changes or debounced value changes
     *
     */
    queryFn: () => fetchUsers(page),
    queryKey: [page],
    select: transformData,
  });
  const {
    isLoading: searchLoading,
    data: searchData,
    error: searchError,
    isFetched: searchFetched,
  } = useQuery({
    queryFn: () => handleSearch(debouncedValue, page),
    queryKey: [debouncedValue, page],
    retry: false,
    select: transformData,
  });

  /**
   *   when the initial data or searchdata is fetched or pages changes or debounced value changes
   *    we will update the final data
   */
  useEffect(() => {
    setFinalData(initialData?.transformedData);
    setPageCount(Math.ceil(initialData?.count / ROWS_PER_PAGE));
  }, [initalFetched, page, debouncedValue]);
  useEffect(() => {
    setFinalData(searchData?.transformedData);
    setPageCount(Math.ceil(searchData?.count / ROWS_PER_PAGE));
  }, [searchFetched, page, debouncedValue]);

  if (isError || searchError) {
    return (
      <h2>
        {error?.message}
        {searchError?.message}
      </h2>
    );
  }

  return (
    <div className="mx-auto flex content-center items-center flex-col w-full max-w-screen-xl min-h-[80vh] px-2.5 md:px-20">
      <div className="flex justify-between w-full gap-5 px-5 flex-col my-5 md:my-8 md:flex-row ">
        <div className="w-2/4 font-bold text-lg ">Zithara Task</div>
        <div className="w-full md:w-2/4 ">
          <Input
            placeholder="search"
            type="text"
            className="w-full  mr-5"
            onChange={(e) => {
              setSearchValue(e.target.value);
            }}
            value={searchValue}
          />
        </div>
      </div>
      {initialLoading || searchLoading ? (
        <div>loading</div>
      ) : (
        <>
          <div className=" border-2 border-input py-2 px-3 rounded-lg w-full">
            <Table className="overflow-scroll ">
              {/* <TableCaption>A list of all Users.</TableCaption> */}
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
                    <span
                      className={
                        sortDataByDate
                          ? `absolute left-20 rotate-0 transition-transform`
                          : ` absolute left-20 rotate-180 transition-transform`
                      }
                    >
                      <ChevronDown size={20} />
                    </span>
                  </TableHead>
                  <TableHead
                    className="relative"
                    onClick={() => {
                      setSortDataByTime((prev) => !prev);
                    }}
                  >
                    Time
                    <span
                      className={
                        sortDataByTime
                          ? `absolute left-20 rotate-0 transition-transform`
                          : ` absolute left-20 rotate-180 transition-transform`
                      }
                    >
                      {" "}
                      <ChevronDown size={20} />
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
          </div>
        </>
      )}
      {/* <h2>Paginated View</h2>
      <h1>{page}</h1> */}
      {/* {searchValue == "" && initialData && JSON.stringify(initialData)}
      {searchValue != "" && searchData && JSON.stringify(searchData)} */}
      <div className="flex my-8">
        <Button onClick={() => pagination.previous()} disabled={page === 1}>
          Previous
        </Button>
        <div className=" flex">
          {pagination.range.map((x, index) => {
            if (x == "dots") {
              return (
                <div key={index} className="mx-3">
                  ....
                </div>
              );
            } else {
              return (
                <div
                  key={index}
                  className={
                    page == x
                      ? "text-white mx-3 flex items-center justify-center bg-slate-800 w-4 rounded-sm px-5"
                      : " mx-3 flex items-center justify-center"
                  }
                >
                  {x}
                </div>
              );
            }
          })}
        </div>
        <Button
          onClick={() => pagination.next()}
          disabled={page === pagination.range.length}
        >
          Next
        </Button>
      </div>
    </div>
  );
};

export default PaginationPage;
