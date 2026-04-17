export interface JobResult {
  id: string;
  title: string;
  company: string;
  location: string;
  description: string;
  url: string;
  source: string;
}

export async function searchAdzuna(
  role: string,
  location = "india"
): Promise<JobResult[]> {
  const appId = process.env.ADZUNA_APP_ID!;
  const apiKey = process.env.ADZUNA_API_KEY!;
  const url = `https://api.adzuna.com/v1/api/jobs/in/search/1?app_id=${appId}&app_key=${apiKey}&results_per_page=10&what=${encodeURIComponent(role)}&where=${encodeURIComponent(location)}&content-type=application/json`;
  const res = await fetch(url);
  if (!res.ok) return [];
  const data = await res.json();
  return (data.results || []).map((j: any) => ({
    id: j.id,
    title: j.title,
    company: j.company?.display_name || "",
    location: j.location?.display_name || "",
    description: j.description || "",
    url: j.redirect_url,
    source: "adzuna",
  }));
}

export async function searchJSearch(query: string): Promise<JobResult[]> {
  const res = await fetch(
    `https://jsearch.p.rapidapi.com/search?query=${encodeURIComponent(query)}&page=1&num_pages=1`,
    {
      headers: {
        "X-RapidAPI-Key": process.env.RAPIDAPI_KEY!,
        "X-RapidAPI-Host": "jsearch.p.rapidapi.com",
      },
    }
  );
  if (!res.ok) return [];
  const data = await res.json();
  return (data.data || []).map((j: any) => ({
    id: j.job_id,
    title: j.job_title,
    company: j.employer_name,
    location: `${j.job_city || ""} ${j.job_country || ""}`.trim(),
    description: j.job_description || "",
    url: j.job_apply_link,
    source: "jsearch",
  }));
}
