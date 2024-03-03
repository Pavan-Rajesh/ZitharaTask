import { client } from "@/db";
import { NextRequest, NextResponse } from "next/server";
import { ROWS_PER_PAGE } from "@/constants/constant";
export async function POST(request) {
  const { queryValue } = await request.json();
  const page = parseInt(request.nextUrl.searchParams.get("page"));
  const LIMIT = ROWS_PER_PAGE;

  const totalData =
    await client`select * from zithara where customer_name like ${
      "%" + queryValue + "%"
    } or location like ${"%" + queryValue + "%"}`;

  const data = await client`select * from zithara where customer_name like ${
    "%" + queryValue + "%"
  } or location like ${"%" + queryValue + "%"} limit ${LIMIT} offset ${
    (page - 1) * LIMIT
  }`;

  const [{ count }] = await client`select count(*) from zithara;`;
  let End = false;
  if (parseInt(count) == page * LIMIT) {
    End = true;
  }

  return NextResponse.json({
    data,
    hasComeToEnd: End,
    count: totalData.length,
  });
}
