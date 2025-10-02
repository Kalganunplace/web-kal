import { NextRequest, NextResponse } from "next/server";

interface KakaoAddressDocument {
  address_name: string;
  address_type: "REGION" | "ROAD" | "REGION_ADDR" | "ROAD_ADDR";
  x: string;
  y: string;
  address: {
    address_name: string;
    region_1depth_name: string;
    region_2depth_name: string;
    region_3depth_name: string;
    mountain_yn: "Y" | "N";
    main_address_no: string;
    sub_address_no: string;
    zip_code: string;
  };
  road_address: {
    address_name: string;
    region_1depth_name: string;
    region_2depth_name: string;
    region_3depth_name: string;
    road_name: string;
    underground_yn: "Y" | "N";
    main_building_no: string;
    sub_building_no: string;
    building_name: string;
    zone_no: string;
  } | null;
}

interface KakaoKeywordDocument {
  id: string;
  place_name: string;
  address_name: string;
  road_address_name: string;
  x: string;
  y: string;
  phone: string;
  category_name: string;
}

interface KakaoAddressResponse {
  documents: KakaoAddressDocument[];
  meta: {
    total_count: number;
    pageable_count: number;
    is_end: boolean;
  };
}

interface KakaoKeywordResponse {
  documents: KakaoKeywordDocument[];
  meta: {
    total_count: number;
    pageable_count: number;
    is_end: boolean;
  };
}

export interface AddressResult {
  id: string;
  address: string;
  structured_formatting: {
    main_text: string;
    secondary_text: string;
  };
  zonecode?: string;
  roadAddress?: string;
  jibunAddress?: string;
  x?: number;
  y?: number;
}

const extractMainText = (address: string): string => {
  const parts = address.split(" ");
  return parts.slice(-2).join(" ") || address;
};

const extractSecondaryText = (address: string): string => {
  const parts = address.split(" ");
  return parts.slice(0, -2).join(" ") || address;
};

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get("query");

  if (!query || query.length < 2) {
    return NextResponse.json({ results: [] });
  }

  const REST_API_KEY = process.env.NEXT_PUBLIC_KAKAO_REST_API_KEY;

  if (!REST_API_KEY) {
    return NextResponse.json(
      { error: "카카오 REST API 키가 설정되지 않았습니다." },
      { status: 500 }
    );
  }

  try {
    console.log("카카오 주소 검색 시작:", query);
    console.log("API 키 존재:", !!REST_API_KEY);

    // 주소 검색 시도
    const addressUrl = new URL(
      "https://dapi.kakao.com/v2/local/search/address.json"
    );
    addressUrl.searchParams.append("query", query);
    addressUrl.searchParams.append("size", "10");

    console.log("주소 API 호출:", addressUrl.toString());

    const addressResponse = await fetch(addressUrl.toString(), {
      method: "GET",
      headers: {
        Authorization: `KakaoAK ${REST_API_KEY}`,
      },
    });

    console.log("주소 API 응답 상태:", addressResponse.status);

    if (addressResponse.ok) {
      const data: KakaoAddressResponse = await addressResponse.json();
      console.log("주소 API 결과 개수:", data.documents.length);

      if (data.documents.length > 0) {
        const results: AddressResult[] = data.documents.map((doc, index) => {
          const roadAddress = doc.road_address?.address_name || "";
          const jibunAddress = doc.address.address_name || "";
          const mainAddress = roadAddress || jibunAddress;

          return {
            id: String(index),
            address: mainAddress,
            structured_formatting: {
              main_text: extractMainText(mainAddress),
              secondary_text: extractSecondaryText(mainAddress),
            },
            zonecode: doc.road_address?.zone_no || doc.address.zip_code,
            roadAddress: roadAddress,
            jibunAddress: jibunAddress,
            x: parseFloat(doc.x),
            y: parseFloat(doc.y),
          };
        });

        return NextResponse.json({ results });
      }
    } else {
      const errorText = await addressResponse.text();
      console.error("주소 API 오류 응답:", errorText);
    }

    // 주소 검색 결과가 없으면 키워드 검색
    console.log("키워드 검색 시작");
    const keywordUrl = new URL(
      "https://dapi.kakao.com/v2/local/search/keyword.json"
    );
    keywordUrl.searchParams.append("query", query);
    keywordUrl.searchParams.append("size", "10");

    console.log("키워드 API 호출:", keywordUrl.toString());

    const keywordResponse = await fetch(keywordUrl.toString(), {
      method: "GET",
      headers: {
        Authorization: `KakaoAK ${REST_API_KEY}`,
      },
    });

    console.log("키워드 API 응답 상태:", keywordResponse.status);

    if (!keywordResponse.ok) {
      const errorText = await keywordResponse.text();
      console.error("키워드 API 오류 응답:", errorText);
      throw new Error(`카카오 API 오류: ${keywordResponse.status}`);
    }

    const data: KakaoKeywordResponse = await keywordResponse.json();
    console.log("키워드 API 결과 개수:", data.documents.length);

    const results: AddressResult[] = data.documents.map((doc) => {
      const mainAddress = doc.road_address_name || doc.address_name;

      return {
        id: doc.id,
        address: mainAddress,
        structured_formatting: {
          main_text: doc.place_name,
          secondary_text: mainAddress,
        },
        roadAddress: doc.road_address_name,
        jibunAddress: doc.address_name,
        x: parseFloat(doc.x),
        y: parseFloat(doc.y),
      };
    });

    return NextResponse.json({ results });
  } catch (error) {
    console.error("카카오 주소 검색 오류:", error);
    console.error("오류 상세:", error instanceof Error ? error.message : error);
    return NextResponse.json(
      { error: "주소 검색 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
