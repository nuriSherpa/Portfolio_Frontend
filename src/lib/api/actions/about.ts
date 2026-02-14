// src/lib/api/actions/about.ts
'use server';

import { createServerClient } from '../server';
import { ENDPOINTS } from '../endpoints';

interface AboutData {
  bio: string;
  skills?: string[];
  experience?: Array<{
    title: string;
    company: string;
    period: string;
    description: string;
  }>;
  education?: Array<{
    degree: string;
    school: string;
    year: string;
  }>;
}

export async function getAbout() {
  try {
    const client = await createServerClient();
    const { data } = await client.get(ENDPOINTS.about);

    return {
      success: true,
      about: data.data as AboutData,
      error: null,
    };
  } catch (error: any) {
    return {
      success: false,
      about: null,
      error: error.response?.data?.error?.message || 'Failed to load about',
    };
  }
}
