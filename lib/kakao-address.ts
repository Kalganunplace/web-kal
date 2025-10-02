// 카카오 로컬 API 타입 정의
interface KakaoAddressDocument {
  address_name: string;
  address_type: "REGION" | "ROAD" | "REGION_ADDR" | "ROAD_ADDR";
  x: string; // 경도
  y: string; // 위도
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

export interface KakaoAddressService {
  searchAddress: (query: string) => Promise<AddressResult[]>;
  searchKeyword: (query: string) => Promise<AddressResult[]>;
}

// 카카오 로컬 API를 활용한 주소 검색 서비스
class KakaoAddressAPI implements KakaoAddressService {
  private readonly REST_API_KEY = process.env.NEXT_PUBLIC_KAKAO_REST_API_KEY;
  private readonly ADDRESS_API_URL = "https://dapi.kakao.com/v2/local/search/address.json";
  private readonly KEYWORD_API_URL = "https://dapi.kakao.com/v2/local/search/keyword.json";

  private getHeaders(): HeadersInit {
    if (!this.REST_API_KEY) {
      throw new Error("카카오 REST API 키가 설정되지 않았습니다.");
    }
    return {
      Authorization: `KakaoAK ${this.REST_API_KEY}`,
    };
  }

  /**
   * 주소 검색 API
   * 정확한 주소를 검색할 때 사용
   */
  async searchAddress(query: string): Promise<AddressResult[]> {
    if (!query || query.length < 2) {
      return [];
    }

    try {
      const url = new URL(this.ADDRESS_API_URL);
      url.searchParams.append("query", query);
      url.searchParams.append("size", "10"); // 최대 10개

      const response = await fetch(url.toString(), {
        method: "GET",
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        throw new Error(`카카오 API 오류: ${response.status}`);
      }

      const data: KakaoAddressResponse = await response.json();

      return data.documents.map((doc, index) => {
        const roadAddress = doc.road_address?.address_name || "";
        const jibunAddress = doc.address.address_name || "";
        const mainAddress = roadAddress || jibunAddress;

        return {
          id: String(index),
          address: mainAddress,
          structured_formatting: {
            main_text: this.extractMainText(mainAddress),
            secondary_text: this.extractSecondaryText(mainAddress),
          },
          zonecode: doc.road_address?.zone_no || doc.address.zip_code,
          roadAddress: roadAddress,
          jibunAddress: jibunAddress,
          x: parseFloat(doc.x),
          y: parseFloat(doc.y),
        };
      });
    } catch (error) {
      console.error("카카오 주소 검색 오류:", error);
      return [];
    }
  }

  /**
   * 키워드 검색 API
   * 건물명, 장소명 등으로 검색할 때 사용
   */
  async searchKeyword(query: string): Promise<AddressResult[]> {
    if (!query || query.length < 2) {
      return [];
    }

    try {
      const url = new URL(this.KEYWORD_API_URL);
      url.searchParams.append("query", query);
      url.searchParams.append("size", "10");

      const response = await fetch(url.toString(), {
        method: "GET",
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        throw new Error(`카카오 API 오류: ${response.status}`);
      }

      const data: KakaoKeywordResponse = await response.json();

      return data.documents.map((doc) => {
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
    } catch (error) {
      console.error("카카오 키워드 검색 오류:", error);
      return [];
    }
  }

  /**
   * 통합 검색 (주소 + 키워드)
   * 주소 검색 결과가 없으면 키워드 검색 수행
   */
  async search(query: string): Promise<AddressResult[]> {
    const addressResults = await this.searchAddress(query);

    if (addressResults.length > 0) {
      return addressResults;
    }

    return await this.searchKeyword(query);
  }

  private extractMainText(address: string): string {
    const parts = address.split(" ");
    return parts.slice(-2).join(" ") || address;
  }

  private extractSecondaryText(address: string): string {
    const parts = address.split(" ");
    return parts.slice(0, -2).join(" ") || address;
  }
}

// 싱글톤 인스턴스
let kakaoAddressInstance: KakaoAddressAPI | null = null;

export const getKakaoAddressService = (): KakaoAddressAPI => {
  if (!kakaoAddressInstance) {
    kakaoAddressInstance = new KakaoAddressAPI();
  }

  return kakaoAddressInstance;
};

// 한국 지역 검증 함수
export const isKoreanAddress = (address: string): boolean => {
  const koreanRegions = [
    "서울",
    "부산",
    "대구",
    "인천",
    "광주",
    "대전",
    "울산",
    "세종",
    "경기",
    "강원",
    "충북",
    "충남",
    "전북",
    "전남",
    "경북",
    "경남",
    "제주",
  ];

  return koreanRegions.some((region) => address.includes(region));
};

// 대구 지역 검증 함수 (서비스 지원 지역)
export const isDaeguAddress = (address: string): boolean => {
  const daeguDistricts = [
    "대구",
    "중구",
    "동구",
    "서구",
    "남구",
    "북구",
    "수성구",
    "달서구",
    "달성군",
  ];
  return daeguDistricts.some((district) => address.includes(district));
};

export type { KakaoAddressDocument, KakaoKeywordDocument };
