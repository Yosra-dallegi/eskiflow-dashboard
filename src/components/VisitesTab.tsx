import React, { useState, useMemo, useRef, useEffect } from 'react';
import { 
  MapPin, 
  Calendar, 
  UserCheck, 
  Search, 
  Download, 
  ShieldCheck, 
  AlertTriangle, 
  ChevronLeft, 
  ChevronRight, 
  Eye, 
  Filter, 
  RotateCcw,
  Navigation,
  CheckCircle2,
  XCircle,
  Users,
  Compass
} from 'lucide-react';
import L from 'leaflet';
import { VisiteItem } from '../types/task';
import { exportVisitesExcel } from '../services/exportService';
import { CDZ_LIST, CdzPermissions, getAuthorizedTeamEmails } from '../data/cdzHierarchy';
import { MultiSelectFilter } from './MultiSelectFilter';

interface VisitesTabProps {
  visites: VisiteItem[];
  accessMode: string; // 'MANAGER' ou email
  customPermissions?: Record<string, CdzPermissions>;
  managerEmails?: string[];
}

export const VisitesTab: React.FC<VisitesTabProps> = ({ visites, accessMode, customPermissions, managerEmails }) => {
  // Filters state (Multi-select)
  const [filterStatutGpsList, setFilterStatutGpsList] = useState<string[]>([]);
  const [filterVisiteurs, setFilterVisiteurs] = useState<string[]>([]);
  const [filterDateFrom, setFilterDateFrom] = useState<string>('');
  const [filterDateTo, setFilterDateTo] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  // UI View state
  const [showMap, setShowMap] = useState<boolean>(true);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(20);
  const [selectedVisite, setSelectedVisite] = useState<VisiteItem | null>(null);

  // Map references
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstance = useRef<L.Map | null>(null);
  const markersLayer = useRef<L.LayerGroup | null>(null);

  // Current active CDZ profile info if not Manager
  const activeCdzProfile = useMemo(() => {
    if (!accessMode || accessMode === 'MANAGER') return null;
    return CDZ_LIST.find((c) => c.email.toLowerCase() === accessMode.toLowerCase()) || null;
  }, [accessMode]);

  // 1. Scoped Visites: restrict to authorized team emails if not Manager
  const scopedVisites = useMemo(() => {
    if (!accessMode || accessMode === 'MANAGER') return visites;
    const authorized = getAuthorizedTeamEmails(accessMode, customPermissions, managerEmails);
    if (!authorized) return visites;
    const teamSet = new Set(authorized.map((e) => e.toLowerCase()));
    return visites.filter((v) => {
      const email = (v.visiteurEmail || '').toLowerCase();
      return teamSet.has(email);
    });
  }, [visites, accessMode, customPermissions, managerEmails]);

  // 2. Filtered Visites based on user filters
  const filteredVisites = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return scopedVisites.filter((v) => {
      if (filterStatutGpsList.length > 0 && !filterStatutGpsList.includes(v.statutGps)) return false;
      if (filterVisiteurs.length > 0 && !filterVisiteurs.includes((v.visiteurEmail || '').toLowerCase())) return false;
      if (filterDateFrom && v.date && v.date < filterDateFrom) return false;
      if (filterDateTo && v.date && v.date > filterDateTo) return false;
      if (q) {
        const matchCode = (v.codeClient || '').toLowerCase().includes(q);
        const matchNom = (v.clientNom || '').toLowerCase().includes(q);
        const matchVis = (v.visiteurNom || '').toLowerCase().includes(q) || (v.visiteurEmail || '').toLowerCase().includes(q);
        const matchAct = (v.activite || '').toLowerCase().includes(q);
        if (!matchCode && !matchNom && !matchVis && !matchAct) return false;
      }
      return true;
    });
  }, [scopedVisites, filterStatutGpsList, filterVisiteurs, filterDateFrom, filterDateTo, searchQuery]);

  // Unique Visitors for the dropdown (strictly scoped to available team)
  const availableVisitors = useMemo(() => {
    const map = new Map<string, { email: string; nom: string }>();
    scopedVisites.forEach((v) => {
      const email = (v.visiteurEmail || '').toLowerCase();
      if (email && !map.has(email)) {
        map.set(email, { email, nom: v.visiteurNom || email });
      }
    });
    return Array.from(map.values()).sort((a, b) => a.nom.localeCompare(b.nom, 'fr'));
  }, [scopedVisites]);

  // KPIs
  const totalVisites = filteredVisites.length;
  const countSurSite = useMemo(() => filteredVisites.filter((v) => v.statutGps === 'Sur site').length, [filteredVisites]);
  const countHorsZone = useMemo(() => filteredVisites.filter((v) => v.statutGps === 'Hors zone').length, [filteredVisites]);
  const countGeolocalisees = useMemo(() => filteredVisites.filter((v) => v.hasCoords).length, [filteredVisites]);
  const distinctClients = useMemo(() => new Set(filteredVisites.map((v) => v.codeClient).filter(Boolean)).size, [filteredVisites]);
  const distinctVisiteurs = useMemo(() => new Set(filteredVisites.map((v) => v.visiteurEmail).filter(Boolean)).size, [filteredVisites]);
  const tauxConformite = totalVisites > 0 ? Math.round((countSurSite * 100) / totalVisites) : 0;

  // Synthesis by Visitor (Leaderboard)
  const visitorStats = useMemo(() => {
    const stats: Record<string, { email: string; nom: string; role: string; total: number; surSite: number; horsZone: number }> = {};
    filteredVisites.forEach((v) => {
      const email = (v.visiteurEmail || 'inconnu').toLowerCase();
      if (!stats[email]) {
        stats[email] = {
          email,
          nom: v.visiteurNom || email,
          role: v.role || 'SUP',
          total: 0,
          surSite: 0,
          horsZone: 0
        };
      }
      stats[email].total++;
      if (v.statutGps === 'Sur site') stats[email].surSite++;
      else stats[email].horsZone++;
    });
    return Object.values(stats).sort((a, b) => b.total - a.total);
  }, [filteredVisites]);

  // Leaflet Map Initialization & Markers
  useEffect(() => {
    if (!showMap || !mapContainerRef.current) return;

    if (!mapInstance.current) {
      const map = L.map(mapContainerRef.current, {
        center: [35.5, 9.8], // Centre Tunisie
        zoom: 7,
        zoomControl: true
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 18
      }).addTo(map);

      markersLayer.current = L.layerGroup().addTo(map);
      mapInstance.current = map;
    }

    const map = mapInstance.current;
    if (!map || !markersLayer.current) return;

    markersLayer.current.clearLayers();

    // Icon generators
    const createMarkerIcon = (isSurSite: boolean) => {
      const color = isSurSite ? '#10b981' : '#ef4444';
      const border = isSurSite ? '#059669' : '#dc2626';
      return L.divIcon({
        className: 'custom-visite-marker',
        html: `<div style="
          background-color: ${color};
          width: 14px;
          height: 14px;
          border-radius: 50%;
          border: 2px solid white;
          box-shadow: 0 0 5px ${border};
        "></div>`,
        iconSize: [14, 14],
        iconAnchor: [7, 7]
      });
    };

    const pointsWithCoords = filteredVisites.filter((v) => v.hasCoords && v.lat && v.lng);
    // Limit to max 500 points for smooth map rendering
    const renderPoints = pointsWithCoords.slice(0, 500);

    renderPoints.forEach((v) => {
      const isSurSite = v.statutGps === 'Sur site';
      const marker = L.marker([v.lat!, v.lng!], {
        icon: createMarkerIcon(isSurSite)
      });

      const popupHtml = `
        <div style="font-family: inherit; font-size: 13px; line-height: 1.4; min-width: 180px;">
          <div style="font-weight: 700; color: #0f172a; margin-bottom: 2px;">${v.clientNom}</div>
          <div style="font-size: 11px; color: #64748b; margin-bottom: 6px;">Code: <b>${v.codeClient}</b> ${v.activite ? `• ${v.activite}` : ''}</div>
          <div style="margin-bottom: 4px;">
            <span style="
              display: inline-block; 
              padding: 2px 6px; 
              font-size: 11px; 
              font-weight: 600; 
              border-radius: 9999px;
              background-color: ${isSurSite ? '#d1fae5' : '#fee2e2'};
              color: ${isSurSite ? '#065f46' : '#991b1b'};
            ">
              ${isSurSite ? '✅ Sur site' : '❌ Hors zone'}
            </span>
          </div>
          <div style="font-size: 12px; color: #334155; margin-bottom: 2px;">📅 <b>${v.date}</b></div>
          <div style="font-size: 12px; color: #334155;">👤 <b>${v.visiteurNom}</b></div>
          <div style="font-size: 11px; color: #64748b;">${v.visiteurEmail}</div>
          <div style="margin-top: 8px; font-size: 11px; color: #0284c7;">
            📍 ${v.lat?.toFixed(5)}, ${v.lng?.toFixed(5)}
          </div>
        </div>
      `;

      marker.bindPopup(popupHtml);
      markersLayer.current?.addLayer(marker);
    });

    if (renderPoints.length > 0) {
      const bounds = L.latLngBounds(renderPoints.map((v) => [v.lat!, v.lng!]));
      map.fitBounds(bounds, { padding: [30, 30], maxZoom: 14 });
    }

    setTimeout(() => map.invalidateSize(), 200);
  }, [showMap, filteredVisites]);

  // Center map on specific visit
  const handleCenterOnMap = (visite: VisiteItem) => {
    setSelectedVisite(visite);
    if (!showMap) setShowMap(true);
    if (visite.lat && visite.lng && mapInstance.current) {
      mapInstance.current.setView([visite.lat, visite.lng], 15, { animate: true });
      // Open popup on that coordinate
      setTimeout(() => {
        if (!mapInstance.current) return;
        L.popup()
          .setLatLng([visite.lat!, visite.lng!])
          .setContent(`
            <div style="font-family: inherit; font-size: 13px;">
              <b>${visite.clientNom}</b> (Code: ${visite.codeClient})<br>
              Date: <b>${visite.date}</b><br>
              Visiteur: <b>${visite.visiteurNom}</b><br>
              Statut: <b>${visite.statutGps}</b>
            </div>
          `)
          .openOn(mapInstance.current);
      }, 300);
    }
  };

  // Pagination
  const totalPages = Math.ceil(filteredVisites.length / pageSize) || 1;
  const paginatedVisites = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredVisites.slice(start, start + pageSize);
  }, [filteredVisites, currentPage, pageSize]);

  const handleResetFilters = () => {
    setFilterStatutGpsList([]);
    setFilterVisiteurs([]);
    setFilterDateFrom('');
    setFilterDateTo('');
    setSearchQuery('');
    setCurrentPage(1);
  };

  return (
    <div className="space-y-6">
      {/* 1. Header Banner & Access Scope Indicator */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 shadow-sm border border-slate-200 dark:border-slate-700 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
              <Navigation className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                Suivi des Visites Clients sur le Terrain
                {activeCdzProfile ? (
                  <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300 border border-emerald-300">
                    🔒 Équipe CDZ : {activeCdzProfile.name}
                  </span>
                ) : (
                  <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300 border border-blue-300">
                    👑 Accès Direction / Manager (Toutes les équipes)
                  </span>
                )}
              </h1>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                Pointages GPS, respect du périmètre client (Sur site vs Hors zone) et activité des équipes commerciales Vilavi
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setShowMap(!showMap)}
            className={`px-3.5 py-2 text-sm font-medium rounded-xl border transition-colors flex items-center gap-2 ${
              showMap
                ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-700'
                : 'bg-slate-50 dark:bg-slate-700 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-600'
            }`}
          >
            <Compass className="w-4 h-4" />
            {showMap ? 'Masquer la Carte' : 'Afficher la Carte'}
          </button>

          <button
            onClick={() => exportVisitesExcel(filteredVisites)}
            className="px-3.5 py-2 text-sm font-medium rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm hover:shadow transition-all flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Exporter Excel
          </button>
        </div>
      </div>

      {/* 2. KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5">
        <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <div className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Total Visites</div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{totalVisites.toLocaleString('fr-FR')}</div>
          <div className="text-xs text-slate-400 mt-1">sur la sélection</div>
        </div>

        <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-emerald-200 dark:border-emerald-800/40 bg-emerald-50/20 dark:bg-emerald-950/20 shadow-sm">
          <div className="text-xs font-medium text-emerald-700 dark:text-emerald-400 uppercase tracking-wider flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" /> Sur Site
          </div>
          <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">{countSurSite.toLocaleString('fr-FR')}</div>
          <div className="text-xs text-emerald-600/80 font-medium mt-1">
            {tauxConformite}% de conformité GPS
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-red-200 dark:border-red-800/40 bg-red-50/20 dark:bg-red-950/20 shadow-sm">
          <div className="text-xs font-medium text-red-700 dark:text-red-400 uppercase tracking-wider flex items-center gap-1">
            <XCircle className="w-3.5 h-3.5" /> Hors Zone
          </div>
          <div className="text-2xl font-bold text-red-600 dark:text-red-400 mt-1">{countHorsZone.toLocaleString('fr-FR')}</div>
          <div className="text-xs text-red-600/80 font-medium mt-1">
            {totalVisites > 0 ? Math.round((countHorsZone * 100) / totalVisites) : 0}% hors périmètre
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <div className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5" /> Avec GPS
          </div>
          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400 mt-1">{countGeolocalisees.toLocaleString('fr-FR')}</div>
          <div className="text-xs text-slate-400 mt-1">coordonnées réelles</div>
        </div>

        <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <div className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Clients Uniques</div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{distinctClients.toLocaleString('fr-FR')}</div>
          <div className="text-xs text-slate-400 mt-1">points de vente</div>
        </div>

        <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <div className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1">
            <Users className="w-3.5 h-3.5" /> Visiteurs
          </div>
          <div className="text-2xl font-bold text-purple-600 dark:text-purple-400 mt-1">{distinctVisiteurs}</div>
          <div className="text-xs text-slate-400 mt-1">commerciaux actifs</div>
        </div>
      </div>

      {/* 3. Interactive Leaflet Map */}
      {showMap && (
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-4 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <h2 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                Cartographie des pointages sur le terrain ({countGeolocalisees} positions GPS)
              </h2>
            </div>
            <div className="flex items-center gap-4 text-xs">
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block"></span>
                <span className="text-slate-600 dark:text-slate-300 font-medium">Sur site ({countSurSite})</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-red-500 inline-block"></span>
                <span className="text-slate-600 dark:text-slate-300 font-medium">Hors zone ({countHorsZone})</span>
              </span>
            </div>
          </div>
          <div
            ref={mapContainerRef}
            className="w-full h-80 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700"
          />
        </div>
      )}

      {/* 4. Filters Bar */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-4 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm font-bold text-slate-800 dark:text-slate-200">
            <Filter className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            Filtres des Visites
          </div>
          {(filterStatutGpsList.length > 0 || filterVisiteurs.length > 0 || filterDateFrom || filterDateTo || searchQuery) && (
            <button
              onClick={handleResetFilters}
              className="text-xs text-blue-600 hover:text-blue-700 dark:text-blue-400 flex items-center gap-1 font-medium cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Réinitialiser les filtres
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 items-end">
          {/* Recherche texte */}
          <div className="relative">
            <span className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Recherche</span>
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                placeholder="Client, code, activité..."
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Filtre Statut GPS (Multi-select) */}
          <div>
            <MultiSelectFilter
              label="Statut GPS"
              placeholder="Tous les statuts"
              options={[
                { value: 'Sur site', label: '✅ Sur site (Pointage valide)' },
                { value: 'Hors zone', label: '❌ Hors zone (Écart périmètre)' },
                { value: 'Non spécifié', label: '⚪ Non spécifié' }
              ]}
              selectedValues={filterStatutGpsList}
              onChange={(vals) => { setFilterStatutGpsList(vals); setCurrentPage(1); }}
            />
          </div>

          {/* Filtre Visiteur (Multi-select restreint à l'équipe autorisée) */}
          <div>
            <MultiSelectFilter
              label={activeCdzProfile ? `Équipe CDZ (${activeCdzProfile.name})` : 'Visiteurs autorisés'}
              placeholder="Tous les visiteurs"
              options={availableVisitors.map((vis) => ({ value: vis.email, label: vis.nom }))}
              selectedValues={filterVisiteurs}
              onChange={(vals) => { setFilterVisiteurs(vals); setCurrentPage(1); }}
            />
          </div>

          {/* Date Début */}
          <div className="relative">
            <input
              type="date"
              value={filterDateFrom}
              onChange={(e) => { setFilterDateFrom(e.target.value); setCurrentPage(1); }}
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
              title="Date début"
            />
          </div>

          {/* Date Fin */}
          <div className="relative">
            <input
              type="date"
              value={filterDateTo}
              onChange={(e) => { setFilterDateTo(e.target.value); setCurrentPage(1); }}
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
              title="Date fin"
            />
          </div>
        </div>
      </div>

      {/* 5. Team Synthesis Leaderboard (Collapsible / Preview) */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5 shadow-sm">
        <h2 className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-3 flex items-center justify-between">
          <span className="flex items-center gap-2">
            <UserCheck className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            Performance & Taux de Respect GPS par Commercial ({visitorStats.length} intervenants)
          </span>
          <span className="text-xs font-normal text-slate-400">
            Trié par nombre de visites décroissant
          </span>
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 dark:bg-slate-900/50 text-slate-500 dark:text-slate-400 text-xs uppercase">
              <tr>
                <th className="py-2.5 px-3 rounded-l-lg">Commercial / Visiteur</th>
                <th className="py-2.5 px-3">Rôle</th>
                <th className="py-2.5 px-3 text-right">Total Visites</th>
                <th className="py-2.5 px-3 text-right">Sur Site</th>
                <th className="py-2.5 px-3 text-right">Hors Zone</th>
                <th className="py-2.5 px-3 rounded-r-lg" style={{ minWidth: 160 }}>Taux Respect GPS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
              {visitorStats.slice(0, 8).map((st) => {
                const pct = st.total > 0 ? Math.round((st.surSite * 100) / st.total) : 0;
                return (
                  <tr key={st.email} className="hover:bg-slate-50/50 dark:hover:bg-slate-700/30 transition-colors">
                    <td className="py-2.5 px-3 font-medium text-slate-800 dark:text-slate-200">
                      {st.nom}
                      <span className="block text-xs font-normal text-slate-400">{st.email}</span>
                    </td>
                    <td className="py-2.5 px-3">
                      <span className="text-xs px-2 py-0.5 rounded-md font-medium bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                        {st.role}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-right font-bold text-slate-800 dark:text-slate-200">
                      {st.total.toLocaleString('fr-FR')}
                    </td>
                    <td className="py-2.5 px-3 text-right font-semibold text-emerald-600 dark:text-emerald-400">
                      {st.surSite}
                    </td>
                    <td className="py-2.5 px-3 text-right font-semibold text-red-600 dark:text-red-400">
                      {st.horsZone}
                    </td>
                    <td className="py-2.5 px-3">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              pct >= 50 ? 'bg-emerald-500' : pct >= 20 ? 'bg-amber-500' : 'bg-red-500'
                            }`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <span className="text-xs font-bold text-slate-700 dark:text-slate-300 min-w-10 text-right">
                          {pct}%
                        </span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* 6. Detailed Visits Table with Pagination */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            Journal détaillé des visites
            <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
              {filteredVisites.length} enregistrements
            </span>
          </h2>

          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span>Afficher par page :</span>
            <select
              value={pageSize}
              onChange={(e) => { setPageSize(Number(e.target.value)); setCurrentPage(1); }}
              className="px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-300"
            >
              <option value={15}>15</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead className="bg-slate-50 dark:bg-slate-900/60 text-slate-500 dark:text-slate-400 text-xs uppercase font-semibold">
              <tr>
                <th className="py-3 px-3.5">ID & Date</th>
                <th className="py-3 px-3.5">Client</th>
                <th className="py-3 px-3.5">Statut GPS</th>
                <th className="py-3 px-3.5">Pointage GPS</th>
                <th className="py-3 px-3.5">Visiteur</th>
                <th className="py-3 px-3.5">CDZ Rattaché</th>
                <th className="py-3 px-3.5 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
              {paginatedVisites.map((v) => {
                const isSurSite = v.statutGps === 'Sur site';
                return (
                  <tr
                    key={v.id}
                    className="hover:bg-slate-50/70 dark:hover:bg-slate-700/40 transition-colors"
                  >
                    {/* ID & Date */}
                    <td className="py-3 px-3.5">
                      <div className="font-semibold text-slate-900 dark:text-white font-mono text-xs">
                        {v.id}
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-0.5">
                        <Calendar className="w-3 h-3" />
                        {v.date}
                      </div>
                    </td>

                    {/* Client */}
                    <td className="py-3 px-3.5">
                      <div className="font-semibold text-slate-800 dark:text-slate-200">
                        {v.clientNom}
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-2 mt-0.5">
                        <span className="font-mono text-[11px] bg-slate-100 dark:bg-slate-700 px-1.5 py-0.2 rounded">
                          {v.codeClient}
                        </span>
                        {v.activite && (
                          <span className="truncate max-w-[140px] text-[11px] text-slate-400">
                            {v.activite}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Statut GPS */}
                    <td className="py-3 px-3.5">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${
                          isSurSite
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700'
                            : 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300 border border-red-300 dark:border-red-700'
                        }`}
                      >
                        {isSurSite ? (
                          <>
                            <CheckCircle2 className="w-3 h-3" /> Sur site
                          </>
                        ) : (
                          <>
                            <XCircle className="w-3 h-3" /> Hors zone
                          </>
                        )}
                      </span>
                    </td>

                    {/* Pointage GPS */}
                    <td className="py-3 px-3.5">
                      {v.hasCoords && v.lat && v.lng ? (
                        <div className="text-xs font-mono text-slate-700 dark:text-slate-300">
                          <div>{v.lat.toFixed(5)}</div>
                          <div className="text-slate-400">{v.lng.toFixed(5)}</div>
                        </div>
                      ) : (
                        <span className="text-xs text-slate-400 italic">
                          {v.positionRaw || 'Aucune coordonnée'}
                        </span>
                      )}
                    </td>

                    {/* Visiteur */}
                    <td className="py-3 px-3.5">
                      <div className="font-medium text-slate-800 dark:text-slate-200">
                        {v.visiteurNom}
                      </div>
                      <div className="text-xs text-slate-400 truncate max-w-[160px]">
                        {v.visiteurEmail}
                      </div>
                    </td>

                    {/* CDZ Rattaché */}
                    <td className="py-3 px-3.5">
                      <div className="text-xs font-medium text-slate-700 dark:text-slate-300">
                        {v.cdzNom || '— Non assigné —'}
                      </div>
                    </td>

                    {/* Action */}
                    <td className="py-3 px-3.5 text-center">
                      {v.hasCoords && v.lat && v.lng ? (
                        <button
                          onClick={() => handleCenterOnMap(v)}
                          className="p-1.5 rounded-lg bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-800/40 transition-colors"
                          title="Localiser sur la carte"
                        >
                          <MapPin className="w-4 h-4" />
                        </button>
                      ) : (
                        <span className="text-xs text-slate-300 dark:text-slate-600">—</span>
                      )}
                    </td>
                  </tr>
                );
              })}

              {paginatedVisites.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-slate-400">
                    Aucune visite trouvée pour les filtres sélectionnés.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination controls */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-700 text-xs">
            <span className="text-slate-500">
              Page <b>{currentPage}</b> sur <b>{totalPages}</b> (Total : {filteredVisites.length} visites)
            </span>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 disabled:opacity-40 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors flex items-center gap-1 text-slate-700 dark:text-slate-300"
              >
                <ChevronLeft className="w-3.5 h-3.5" /> Précédent
              </button>

              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 disabled:opacity-40 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors flex items-center gap-1 text-slate-700 dark:text-slate-300"
              >
                Suivant <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
