import { handleErrorResponse } from 'app/api/_utils/errorHandler';
import { REGION_COORDINATES } from 'constant/location';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { dynamicRegionCounter } from 'utils/dynamicKeyCounter';
import { createClient } from 'utils/supabase/server';

export async function GET(request: Request) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const url = new URL(request.url);
  const categoriesStr = url.searchParams.get('category');
  const categories = categoriesStr ? categoriesStr.split(',') : [];

  try {
    const { data, error } = await supabase
      .from('traffic_hub')
      .select('*')
      .or(categories.map((category) => `source.eq.${category}`).join(','));

    if (error) {
      throw new Error(error.message);
    }

    const regionCounterResult = dynamicRegionCounter(data);

    const updatedRegionCoordinates = REGION_COORDINATES.map((region, idx) => ({
      id: idx,
      ...region,
      count: regionCounterResult[region.label] || 0,
    }));

    return new NextResponse(JSON.stringify(updatedRegionCoordinates), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return handleErrorResponse(error);
  }
}
