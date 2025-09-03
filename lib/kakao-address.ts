interface AddressResult {
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

interface NaverAddressService {
  searchPlaces: (query: string) => Promise<AddressResult[]>;
}

// 네이버 지도 Geocoding API를 활용한 주소 검색 서비스
class NaverAddressAPI implements NaverAddressService {
  private readonly CLIENT_ID = process.env.NEXT_PUBLIC_NAVER_CLIENT_ID;

  constructor() {
    this.loadNaverMapsScript();
  }

  private loadNaverMapsScript(): void {
    if (typeof window === 'undefined') return;
    
    if (!document.getElementById('naver-maps-script') && this.CLIENT_ID) {
      const script = document.createElement('script');
      script.id = 'naver-maps-script';
      script.src = `https://oapi.map.naver.com/openapi/v3/maps.js?ncpKeyId=${this.CLIENT_ID}&submodules=geocoder`;
      script.async = true;
      document.head.appendChild(script);
    }
  }

  async searchPlaces(query: string): Promise<AddressResult[]> {
    if (!query || query.length < 2) {
      return [];
    }

    if (!this.CLIENT_ID) {
      console.error('네이버 지도 API 클라이언트 ID가 설정되지 않았습니다.');
      return [];
    }

    return new Promise((resolve) => {
      // 네이버 지도 스크립트가 로드될 때까지 대기
      const checkNaverMaps = () => {
        if (typeof window !== 'undefined' && (window as any).naver && (window as any).naver.maps && (window as any).naver.maps.Service) {
          this.performGeocode(query, resolve);
        } else {
          setTimeout(checkNaverMaps, 100);
        }
      };
      
      checkNaverMaps();
    });
  }

  private performGeocode(query: string, resolve: (results: AddressResult[]) => void): void {
    const naver = (window as any).naver;
    
    naver.maps.Service.geocode({
      query: query
    }, (status: any, response: any) => {
      if (status === naver.maps.Service.Status.OK) {
        const results: AddressResult[] = response.v2.addresses.map((item: any, index: number) => ({
          id: String(index),
          address: item.roadAddress || item.jibunAddress,
          structured_formatting: {
            main_text: this.extractMainText(item.roadAddress || item.jibunAddress),
            secondary_text: this.extractSecondaryText(item.roadAddress || item.jibunAddress)
          },
          roadAddress: item.roadAddress,
          jibunAddress: item.jibunAddress,
          x: parseFloat(item.x),
          y: parseFloat(item.y)
        }));
        
        resolve(results.slice(0, 5));
      } else {
        console.error('네이버 지도 API 오류:', status);
        resolve([]);
      }
    });
  }

  private extractMainText(address: string): string {
    const parts = address.split(' ');
    return parts.slice(-2).join(' ') || address;
  }

  private extractSecondaryText(address: string): string {
    const parts = address.split(' ');
    return parts.slice(0, -2).join(' ') || address;
  }
}

// 싱글톤 인스턴스
let naverAddressInstance: NaverAddressAPI | null = null;

export const getNaverAddressService = (): NaverAddressAPI => {
  if (typeof window === 'undefined') {
    throw new Error('네이버 지도 API는 클라이언트 사이드에서만 사용할 수 있습니다');
  }

  if (!naverAddressInstance) {
    naverAddressInstance = new NaverAddressAPI();
  }

  return naverAddressInstance;
};

// 기존 호환성을 위한 alias
export const getKakaoAddressService = getNaverAddressService;

// 한국 지역 검증 함수
export const isKoreanAddress = (address: string): boolean => {
  const koreanRegions = [
    '서울', '부산', '대구', '인천', '광주', '대전', '울산', '세종',
    '경기', '강원', '충북', '충남', '전북', '전남', '경북', '경남', '제주'
  ];
  
  return koreanRegions.some(region => address.includes(region));
};

// 대구 지역 검증 함수 (서비스 지원 지역)
export const isDaeguAddress = (address: string): boolean => {
  const daeguDistricts = ['대구', '중구', '동구', '서구', '남구', '북구', '수성구', '달서구', '달성군'];
  return daeguDistricts.some(district => address.includes(district));
};

export type { AddressResult, KakaoAddressService };