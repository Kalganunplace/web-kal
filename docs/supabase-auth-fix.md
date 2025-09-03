# Supabase Auth Webpack 번들링 오류 해결

## 문제 상황

개발 중 간헐적으로 발생하는 webpack 번들링 오류:
```
layout.js:315 Uncaught SyntaxError: Invalid or unexpected token (at layout.js:315:29)
```

이 오류는 Supabase Auth 모듈의 정적 import로 인한 webpack 모듈 파싱 충돌에서 발생했습니다.

## 해결 방법

### 1. Lazy Loading 구현

기존의 정적 import를 동적 import로 변경하여 lazy loading을 구현했습니다.

```typescript
// 기존 코드 (문제 발생)
import { createClient } from '@supabase/supabase-js'
const supabaseClient = createClient<Database>(supabaseUrl, supabaseKey)

// 수정된 코드 (해결)
let supabaseClientInstance: SupabaseClient<Database> | null = null

async function getSupabaseClient(): Promise<SupabaseClient<Database>> {
  if (!supabaseClientInstance) {
    const { createClient } = await import('@supabase/supabase-js')
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    supabaseClientInstance = createClient<Database>(supabaseUrl, supabaseKey)
  }
  return supabaseClientInstance
}
```

### 2. 모든 Supabase 호출 업데이트

`SupabaseAuthClient` 클래스의 모든 메서드에서 lazy loading된 클라이언트를 사용하도록 수정:

```typescript
// 기존 코드
const { data, error } = await supabaseClient.rpc('generate_verification_code', { ... })

// 수정된 코드
const client = await getSupabaseClient()
const { data, error } = await client.rpc('generate_verification_code', { ... })
```

### 3. Webpack 설정 유지

`next.config.mjs`에서 기존 webpack 설정 유지:

```javascript
webpack: (config) => {
  config.resolve.fallback = {
    ...config.resolve.fallback,
    fs: false,
    net: false,
    tls: false,
  }
  
  if (config.module.parser) {
    config.module.parser = {
      ...config.module.parser,
      javascript: {
        ...config.module.parser?.javascript,
        strictExportPresence: false,
      }
    }
  }
  
  return config
}
```

## 수정된 파일

- `/lib/auth/supabase.ts` - 핵심 수정사항
- `/next.config.mjs` - webpack 설정 (기존 유지)

## 테스트 결과

1. **개발 서버**: `npm run dev` 성공
2. **프로덕션 빌드**: `npm run build` 성공
3. **모든 정적 페이지 생성 완료**: 20/20 페이지

## 기술적 배경

### 문제의 원인
- Supabase Auth 모듈의 정적 import가 webpack 번들링 시 파싱 충돌 발생
- 특히 SSR 환경에서 Node.js 모듈과 브라우저 환경의 충돌

### 해결책의 원리
- **동적 import**: 모듈이 실제로 필요할 때만 로드
- **싱글톤 패턴**: 한 번 로드된 클라이언트 인스턴스 재사용
- **Lazy evaluation**: 런타임에 모듈 해석 지연

## 장점

1. **번들링 오류 완전 해결**
2. **성능 최적화**: 필요할 때만 Supabase 모듈 로드
3. **기존 API 호환성 유지**: 모든 인증 기능 정상 작동
4. **메모리 효율성**: 싱글톤 패턴으로 중복 인스턴스 방지

## 추후 고려사항

1. **에러 핸들링**: 동적 import 실패 시 적절한 에러 메시지 제공
2. **타입 안전성**: TypeScript 타입 추론 확인
3. **성능 모니터링**: 첫 로드 시간 측정

## 관련 이슈

이 해결책은 다음과 같은 상황에서 유용합니다:
- Next.js 15 + Supabase Auth 조합
- SSR 환경에서의 모듈 번들링 충돌
- webpack 파서 오류 해결
- 동적 import를 통한 코드 분할 최적화