// AnimeForYou - Data Store (Optimized)
// localStorage = source of truth. Firestore = async backup.

const DataStore = {
  db: null,
  LS_KEY: 'a4y_anime_library',
  LS_VER: 'a4y_ver',
  CURRENT_VER: 5,
  _cache: null,
  _cacheTime: 0,
  CACHE_TTL: 300000, // 5 minutes

  init() {
    if (this.db) return;
    try { if (typeof firebase !== 'undefined' && firebase.apps.length) this.db = firebase.firestore(); } catch (e) {}
    var ver = parseInt(localStorage.getItem(this.LS_VER) || '0');
    if (ver < this.CURRENT_VER) {
      localStorage.removeItem(this.LS_KEY);
      localStorage.setItem(this.LS_VER, String(this.CURRENT_VER));
      this.clearFirestore();
    }
  },

  async clearFirestore() {
    this.init();
    if (!this.db) return;
    try {
      const snapshot = await this.db.collection('anime').get();
      const batch = this.db.batch();
      snapshot.forEach(doc => batch.delete(doc.ref));
      await batch.commit();
    } catch (e) {}
  },

  getList() {
    // Use cache if valid
    var now = Date.now();
    if (this._cache && (now - this._cacheTime) < this.CACHE_TTL) {
      return this._cache;
    }
    try {
      this._cache = JSON.parse(localStorage.getItem(this.LS_KEY) || '[]');
      this._cacheTime = now;
      return this._cache;
    }
    catch (e) { return []; }
  },

  invalidateCache() {
    this._cache = null;
    this._cacheTime = 0;
  },

  setList(list) {
    this.invalidateCache();
    localStorage.setItem(this.LS_KEY, JSON.stringify(list));
  },

  // Normalize anime data - Fable 5 style: clear, concise
  normalizeAnime(a) {
    if (!a.episodes) a.episodes = [];
    if (typeof a.episodes === 'number') {
      a.episodeCount = a.episodes;
      a.episodes = [];
    }
    if (!a.image && a.cover) a.image = a.cover;
    if (!a.id) a.id = Date.now() + Math.floor(Math.random() * 1000);
    if (!a.createdAt) a.createdAt = Date.now();
    return a;
  },

  // Get episode count for display
  getEpCount(a) {
    if (a.episodes && Array.isArray(a.episodes) && a.episodes.length > 0) return a.episodes.length;
    if (a.episodeCount) return a.episodeCount;
    if (typeof a.episodes === 'number') return a.episodes;
    return 0;
  },

  async pushToFirestore(list) {
    this.init();
    if (!this.db) return;
    try {
      const snapshot = await this.db.collection('anime').get();
      const del = this.db.batch();
      snapshot.forEach(doc => del.delete(doc.ref));
      await del.commit();

      for (let i = 0; i < list.length; i += 450) {
        const batch = this.db.batch();
        list.slice(i, i + 450).forEach(a => {
          var docData = {
            id: a.id,
            title: a.title || '',
            description: a.description || '',
            genre: a.genre || '',
            year: a.year || '',
            episodes: a.episodes || [],
            episodeCount: a.episodeCount || (Array.isArray(a.episodes) ? a.episodes.length : 0),
            rating: a.rating || 0,
            image: a.image || '',
            imdbRating: a.imdbRating || '',
            creator: a.creator || '',
            stars: a.stars || '',
            quality: a.quality || '',
            language: a.language || '',
            storyline: a.storyline || '',
            createdAt: a.createdAt || Date.now(),
            packLinks: a.packLinks || [],
            singleEpLinks: a.singleEpLinks || [],
            screenshots: a.screenshots || []
          };
          batch.set(this.db.collection('anime').doc(String(a.id)), docData);
        });
        await batch.commit();
      }
    } catch (e) {
      console.warn('Firestore push failed:', e.message);
    }
  },

  // Fetch latest from Firestore and update localStorage
  async syncFromFirestore() {
    this.init();
    if (!this.db) return false;
    try {
      const snapshot = await this.db.collection('anime').get();
      const list = [];
      snapshot.forEach(doc => {
        var d = doc.data();
        if (!d.id) d.id = parseInt(doc.id);
        list.push(d);
      });
      if (list.length > 0) {
        this.setList(list);
        return true;
      }
    } catch (e) {
      console.warn('Firestore sync failed:', e.message);
    }
    return false;
  },

  async saveAnime(list) {
    this.init();
    let maxId = 0;
    list.forEach(a => { if (a.id && a.id > maxId) maxId = a.id; });
    list.forEach(a => { if (!a.id) { maxId++; a.id = maxId; } });
    list = list.map(a => this.normalizeAnime(a));
    this.setList(list);
    await this.pushToFirestore(list);
    return list;
  },

  async addAnime(anime) {
    const list = this.getList();
    list.push(anime);
    return this.saveAnime(list);
  },

  async deleteAnime(id) {
    const list = this.getList().filter(a => a.id !== id);
    return this.saveAnime(list);
  },

  async seedData() {
    // First try to get latest from Firestore (other browsers' edits)
    await this.syncFromFirestore();
    var list = this.getList();

    // If empty, import from anime-data.js
    if (list.length === 0 && typeof IMPORTED_ANIME !== 'undefined') {
      list = IMPORTED_ANIME;
      this.setList(list);
    }

    // Ensure every anime has proper fields
    var maxId = 0;
    list.forEach(function(a) { if (a.id && a.id > maxId) maxId = a.id; });
    list.forEach(function(a) {
      if (!a.id) { maxId++; a.id = maxId; }
      if (!a.episodes) a.episodes = [];
      if (typeof a.episodes === 'number') { a.episodeCount = a.episodes; a.episodes = []; }
      if (!a.image && a.cover) a.image = a.cover;
      if (!a.createdAt) a.createdAt = Date.now();
    });

    this.setList(list);
  },

  // Add a single anime and push to Firestore
  async addAnimeManual(anime) {
    var list = this.getList();
    var exists = list.find(function(a) { return a.title === anime.title; });
    if (exists) return exists;
    anime.id = anime.id || Date.now();
    anime.createdAt = anime.createdAt || Date.now();
    if (!anime.episodes) anime.episodes = [];
    list.push(anime);
    this.setList(list);
    await this.pushToFirestore(list);
    return anime;
  },

  async getAnimeListAsync() {
    this.init();
    if (!this.db) return this.getList();
    try {
      const snapshot = await this.db.collection('anime').get();
      const list = [];
      snapshot.forEach(doc => { var d = doc.data(); if (!d.id) d.id = parseInt(doc.id); list.push(d); });
      if (list.length) return list;
    } catch (e) {}
    return this.getList();
  }
};
