'use client';

import { useSearchParams } from 'next/navigation';
import SearchPage from '@/app/search/page';

// The startup search page reuses the same search component but within startup layout
export default function StartupSearchPage() {
  return <SearchPage />;
}
