import { client } from "@/db";
import { NextRequest, NextResponse } from "next/server";
import { ROWS_PER_PAGE } from "@/constants/constant";
export async function GET(request) {
  const page = parseInt(request.nextUrl.searchParams.get("page"));
  const LIMIT = ROWS_PER_PAGE;
  const data = await client`select * from zithara limit ${LIMIT} offset ${
    (page - 1) * LIMIT
  } ;`;
  const [{ count }] = await client`select count(*) from zithara;`;
  let End = false;
  if (parseInt(count) == page * LIMIT) {
    End = true;
  }
  console.log(End, parseInt(count), page * LIMIT);
  return NextResponse.json({
    data,
    hasComeToEnd: End,
    count,
  });
}
