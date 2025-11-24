// Simple test function to verify Vercel is working
export default function handler(req: any, res: any) {
  res.json({ 
    status: "ok", 
    message: "Vercel function is working",
    path: req.url 
  });
}

