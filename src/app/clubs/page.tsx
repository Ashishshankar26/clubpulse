'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import AppShell from '@/components/layout/AppShell';
import { useClubPulse } from '@/context/ClubPulseContext';
import { ClubCategory } from '@/types';
import {
  Search,
  Filter,
  Users,
  Calendar,
  Sparkles,
  ChevronRight,
  Flame,
  CheckCircle2,
  Layers,
  ArrowRight,
} from 'lucide-react';

const CATEGORIES: ('All' | ClubCategory)[] = [
  'All',
  'Technology',
  'Design & Creative',
  'Entrepreneurship',
  'Robotics & AI',
  'Literary & Arts',
];

export default function ClubsDiscoveryPage() {
  const { clubs, currentUser } = useClubPulse();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'All' | ClubCategory>('All');
  const [onlyRecruiting, setOnlyRecruiting] = useState(false);

  const filteredClubs = clubs.filter(club => {
    const matchesSearch =
      club.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      club.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      club.shortName.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory =
      selectedCategory === 'All' || club.category === selectedCategory;

    const matchesRecruiting = !onlyRecruiting || club.activeRecruitment;

    return matchesSearch && matchesCategory && matchesRecruiting;
  });

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">
              Module 1 • Club Discovery
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
              Explore Campus Clubs & Organizations
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 mt-1">
              Find technical societies, design guilds, and innovation clubs. Apply to open positions or explore team achievements.
            </p>
          </div>

          <Link
            href="/my-clubs"
            className="self-start md:self-auto px-4 py-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold border border-indigo-200 transition flex items-center gap-1.5"
          >
            <Layers className="w-4 h-4" />
            <span>My Enrolled Clubs ({currentUser.clubsJoined.length})</span>
          </Link>
        </div>

        {/* Filters & Search Toolbar */}
        <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search clubs by name, technology, or activity..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50/50"
              />
            </div>

            {/* Recruiting toggle */}
            <button
              onClick={() => setOnlyRecruiting(!onlyRecruiting)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
                onlyRecruiting
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Actively Recruiting Only</span>
            </button>
          </div>

          {/* Category Pills */}
          <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-slate-100">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mr-1">
              Category:
            </span>
            {CATEGORIES.map(category => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                  selectedCategory === category
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* Clubs Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredClubs.map(club => {
            const isMember = currentUser.clubsJoined.includes(club.id);
            return (
              <div
                key={club.id}
                className="bg-white rounded-3xl overflow-hidden border border-slate-200 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between group"
              >
                <div>
                  {/* Banner Image */}
                  <div className="relative h-36 w-full overflow-hidden bg-slate-100">
                    <img
                      src={club.banner}
                      alt={club.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>

                    {/* Category badge */}
                    <span className="absolute top-3 left-3 text-[10px] font-bold uppercase tracking-wider bg-white/90 backdrop-blur-md text-slate-800 px-2.5 py-1 rounded-full shadow-sm">
                      {club.category}
                    </span>

                    {/* Recruiting badge */}
                    {club.activeRecruitment ? (
                      <span className="absolute top-3 right-3 text-[10px] font-bold uppercase tracking-wider bg-emerald-500 text-white px-2.5 py-1 rounded-full shadow-sm flex items-center gap-1">
                        <Sparkles className="w-3 h-3" />
                        Recruiting
                      </span>
                    ) : (
                      <span className="absolute top-3 right-3 text-[10px] font-semibold uppercase tracking-wider bg-slate-800/80 text-slate-200 px-2.5 py-1 rounded-full backdrop-blur-md">
                        Closed
                      </span>
                    )}

                    {/* Logo & short name */}
                    <div className="absolute -bottom-4 left-5 flex items-end gap-3">
                      <img
                        src={club.logo}
                        alt={club.shortName}
                        className="w-14 h-14 rounded-2xl object-cover ring-4 ring-white shadow-md bg-white"
                      />
                    </div>
                  </div>

                  {/* Club Content */}
                  <div className="pt-6 px-6 pb-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="font-extrabold text-base text-slate-900 group-hover:text-indigo-600 transition">
                        {club.name}
                      </h3>
                      {isMember && (
                        <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-200 shrink-0">
                          Joined
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                      {club.tagline}
                    </p>

                    {/* Meta stats */}
                    <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 text-xs">
                      <div>
                        <span className="text-slate-400 text-[10px] uppercase font-bold">Members</span>
                        <p className="font-bold text-slate-800">{club.memberCount} active</p>
                      </div>
                      <div>
                        <span className="text-slate-400 text-[10px] uppercase font-bold">Lead</span>
                        <p className="font-bold text-slate-800 truncate">{club.leadName}</p>
                      </div>
                    </div>

                    {/* Open roles if recruiting */}
                    {club.activeRecruitment && club.recruitmentRoles.length > 0 && (
                      <div className="pt-2">
                        <span className="text-[10px] font-bold uppercase text-slate-400">
                          Open Roles:
                        </span>
                        <div className="flex flex-wrap gap-1.5 mt-1">
                          {club.recruitmentRoles.slice(0, 2).map((role, idx) => (
                            <span
                              key={idx}
                              className="text-[10px] font-medium bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md"
                            >
                              {role}
                            </span>
                          ))}
                          {club.recruitmentRoles.length > 2 && (
                            <span className="text-[10px] text-slate-400 self-center">
                              +{club.recruitmentRoles.length - 2} more
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Footer Action */}
                <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                  <div className="text-[11px] text-slate-500 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <span>Est. {club.foundedYear}</span>
                  </div>

                  <Link
                    href={`/clubs/${club.id}`}
                    className="inline-flex items-center gap-1 text-xs font-bold text-indigo-600 hover:text-indigo-800"
                  >
                    <span>View Profile</span>
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </AppShell>
  );
}
