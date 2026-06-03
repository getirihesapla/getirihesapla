import React from "react";
import Link from "next/link";
import { getAllPosts } from "@/data/posts";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Blog & Eğitimler | Korfu Finance",
  description: "Bloomberg standartlarında finans, kripto ve ekonomi dünyasından en güncel analizler, yatırım stratejileri ve piyasa yorumları.",
};

const CATEGORIES = ["Tümü", "Yatırım", "Ekonomi", "BES", "Hisse Senedi", "Fonlar", "Makro Analiz"];

export default function BlogIndexPage() {
  const posts = getAllPosts();
  const featuredPost = posts[0];
  const regularPosts = posts.slice(1);

  return (
    <div className="min-h-screen bg-[#020617] text-slate-200">
      <div className="container mx-auto px-4 md:px-8 py-10">
        
        {/* Header Area */}
        <header className="mb-12 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
          <div>
            <h1 className="text-4xl font-serif font-bold text-white flex items-center gap-3">
              <span className="w-2 h-10 bg-indigo-600 rounded-full inline-block"></span>
              Korfu Blog & Eğitimler
            </h1>
            <p className="text-slate-400 mt-3 text-lg max-w-2xl">
              Profesyonel yatırım stratejileri, küresel ekonomi değerlendirmeleri ve veri odaklı piyasa analizleri.
            </p>
          </div>
          
          <div className="relative w-full md:w-72">
            <input 
              type="text" 
              placeholder="Analizlerde ara..." 
              className="w-full bg-slate-900 border border-slate-700 rounded-xl py-3 pl-10 pr-4 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
            />
            <svg className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
          </div>
        </header>

        {/* Categories (Tabs) */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-4 mb-8 border-b border-slate-800">
          {CATEGORIES.map((cat, idx) => (
            <button 
              key={idx}
              className={`px-5 py-2 rounded-full whitespace-nowrap text-sm font-semibold transition-all ${
                idx === 0 
                  ? "bg-indigo-600 text-white" 
                  : "bg-slate-900 text-slate-400 hover:bg-slate-800 hover:text-white border border-slate-800"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Featured Post (Hero) */}
        {featuredPost && (
          <Link href={`/blog/${featuredPost.slug}`} className="group block mb-12">
            <div className="relative bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden flex flex-col md:flex-row transition-all hover:border-indigo-500/50 hover:shadow-[0_0_30px_rgba(79,70,229,0.15)]">
              <div className="md:w-3/5 h-64 md:h-96 relative overflow-hidden">
                <div className="absolute inset-0 bg-indigo-500/10 mix-blend-overlay z-10"></div>
                <img 
                  src={featuredPost.imageUrl} 
                  alt={featuredPost.title} 
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
              </div>
              <div className="md:w-2/5 p-8 md:p-12 flex flex-col justify-center bg-gradient-to-r from-slate-900 to-[#0a0f1d] relative z-20 md:-ml-10">
                <div className="flex gap-2 mb-4">
                  {featuredPost.tags.slice(0, 2).map((tag) => (
                    <span key={tag} className="bg-indigo-500/10 text-indigo-400 text-xs font-bold px-3 py-1 rounded-full border border-indigo-500/20 uppercase tracking-wider">
                      {tag}
                    </span>
                  ))}
                </div>
                <h2 className="text-3xl font-bold text-white mb-4 group-hover:text-indigo-400 transition-colors leading-tight">
                  {featuredPost.title}
                </h2>
                <p className="text-slate-400 mb-6 line-clamp-3">
                  {featuredPost.excerpt}
                </p>
                <div className="flex items-center justify-between mt-auto">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-slate-300">
                      {featuredPost.author.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-200">{featuredPost.author}</p>
                      <p className="text-xs text-slate-500">{new Date(featuredPost.date).toLocaleDateString("tr-TR", { month: 'long', day: 'numeric', year: 'numeric' })} • 5 dk okuma</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Link>
        )}

        {/* Grid Posts */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {regularPosts.map((post) => (
            <Link href={`/blog/${post.slug}`} key={post.id} className="group flex h-full">
              <article className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden transition-all hover:-translate-y-1 hover:border-indigo-500/30 hover:shadow-[0_10px_30px_rgba(0,0,0,0.5)] flex flex-col w-full">
                <div className="h-48 relative overflow-hidden">
                  <img 
                    src={post.imageUrl} 
                    alt={post.title} 
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute top-3 left-3 flex gap-2">
                    {post.tags.slice(0, 1).map((tag) => (
                      <span key={tag} className="bg-slate-900/80 backdrop-blur-md text-white text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border border-slate-700">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="p-6 flex flex-col flex-1">
                  <div className="text-xs font-semibold text-indigo-400 mb-2 flex justify-between items-center">
                    <time>
                      {new Date(post.date).toLocaleDateString("tr-TR", { month: 'long', day: 'numeric' })}
                    </time>
                    <span className="text-slate-500 font-normal">3 dk okuma</span>
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3 group-hover:text-indigo-400 transition-colors line-clamp-2 leading-snug">
                    {post.title}
                  </h3>
                  <p className="text-sm text-slate-400 line-clamp-3 mb-6 flex-1">
                    {post.excerpt}
                  </p>
                  
                  <div className="border-t border-slate-800 pt-4 flex items-center justify-between mt-auto">
                    <span className="text-xs font-medium text-slate-300">{post.author}</span>
                    <span className="text-indigo-500 flex items-center gap-1 text-sm font-bold group-hover:translate-x-1 transition-transform">
                      İncele →
                    </span>
                  </div>
                </div>
              </article>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
