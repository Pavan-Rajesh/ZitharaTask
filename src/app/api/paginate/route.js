import { client } from "@/db";
import { NextRequest, NextResponse } from "next/server";
export async function GET(request) {
  const page = parseInt(request.nextUrl.searchParams.get("page"));
  const LIMIT = 10;
  const data = await client`select * from zithara limit ${LIMIT} offset ${
    page * 10
  } ;`;
  const [{ count }] = await client`select count(*) from zithara;`;
  let End = false;
  if (parseInt(count) == (page + 1) * 10) {
    End = true;
  }
  console.log(End, parseInt(count), (page + 1) * 10);
  return NextResponse.json({ data, hasComeToEnd: End, count });
}
