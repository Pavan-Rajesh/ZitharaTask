import { client } from "@/db";
import { NextRequest, NextResponse } from "next/server";
export async function POST(request) {
  const { queryValue } = await request.json();
  const page = parseInt(request.nextUrl.searchParams.get("page"));
  const LIMIT = 10;

  const data = await client`select * from zithara where customer_name like ${
    "%" + queryValue + "%"
  } or location like ${"%" + queryValue + "%"} limit ${LIMIT} offset ${
    page * 10
  }`;

  const [{ count }] = await client`select count(*) from zithara;`;
  let End = false;
  if (parseInt(count) == (page + 1) * 10) {
    End = true;
  }

  return NextResponse.json({ data, hasComeToEnd: End, count });
}
