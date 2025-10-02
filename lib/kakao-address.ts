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

// 카카오 로컬 API를 활용한 주소 검색 서비스 (서버 사이드)
class KakaoAddressAPI implements KakaoAddressService {
  private readonly API_URL = "/api/kakao/search";

  /**
   * 주소 검색 API
   * 정확한 주소를 검색할 때 사용
   */
  async searchAddress(query: string): Promise<AddressResult[]> {
    return this.search(query);
  }

  /**
   * 키워드 검색 API
   * 건물명, 장소명 등으로 검색할 때 사용
   */
  async searchKeyword(query: string): Promise<AddressResult[]> {
    return this.search(query);
  }

  /**
   * 통합 검색 (서버를 통해 호출)
   */
  async search(query: string): Promise<AddressResult[]> {
    if (!query || query.length < 2) {
      return [];
    }

    try {
      const url = new URL(this.API_URL, window.location.origin);
      url.searchParams.append("query", query);

      const response = await fetch(url.toString());

      if (!response.ok) {
        throw new Error(`주소 검색 API 오류: ${response.status}`);
      }

      const data = await response.json();
      return data.results || [];
    } catch (error) {
      console.error("주소 검색 오류:", error);
      return [];
    }
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
