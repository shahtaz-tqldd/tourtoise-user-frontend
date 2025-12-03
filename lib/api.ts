const API = process.env.NEXT_PUBLIC_BASE_API_ROUTE;

export const api = {
  post: async (url: string, data: any) => {
    const res = await fetch(`${API}${url}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    return res.json();
  },
};
