"use client";

import { useState, useEffect } from "react";
import type { Listing, ListingCategory } from "./types";

const POSTS_KEY = "listing-posts";

function createListing(form: {
  cat: string;
  title: string;
  price: string;
  desc: string;
  hood: string;
  email: string;
  phone: string;
}): Listing {
  const id = `post-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
  return {
    id,
    title: form.title,
    price: Number(form.price) || 0,
    cat: form.cat as ListingCategory,
    hood: form.hood,
    posted: "Just now",
    badge: Number(form.price) > 0 && Number(form.price) < 50 ? "fire" : null,
    desc: form.desc,
    seller: {
      name: form.email.split("@")[0] || "Anonymous",
      score: 91,
      joined: "2024",
    },
    coords: [0, 0],
    imageUrl: undefined,
  };
}

export function usePostStore() {
  const [posts, setPosts] = useState<Listing[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(POSTS_KEY);
      if (stored) setPosts(JSON.parse(stored));
    } catch {}
    setLoaded(true);
  }, []);

  const addPost = (form: {
    cat: string;
    title: string;
    price: string;
    desc: string;
    hood: string;
    email: string;
    phone: string;
  }) => {
    const listing = createListing(form);
    setPosts((prev) => {
      const next = [listing, ...prev];
      try { localStorage.setItem(POSTS_KEY, JSON.stringify(next)); } catch {}
      return next;
    });
    return listing;
  };

  return { posts, addPost, loaded };
}