const SQLiteLoader = (() => {
  let SQL, db;

  const init = async () => {
    if (!SQL) {
      SQL = await initSqlJs({
        locateFile: file => `https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.7.0/${file}`
      });
    }
  };

  const loadFromIndexedDB = () => {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open("CardDB", 1);
      request.onupgradeneeded = event => {
        const idb = event.target.result;
        idb.createObjectStore("sqlite", { keyPath: "id" });
      };
      request.onsuccess = event => {
        const idb = event.target.result;
        const tx = idb.transaction("sqlite", "readonly");
        const store = tx.objectStore("sqlite");
        const getReq = store.get(1);
        getReq.onsuccess = () => {
          const data = getReq.result?.data;
          db = data ? new SQL.Database(new Uint8Array(data)) : new SQL.Database();
          db.run(`
            CREATE TABLE IF NOT EXISTS キャラクター (
              キャラクターID INTEGER PRIMARY KEY,
              キャラクター名 TEXT
            );
            CREATE TABLE IF NOT EXISTS カードリスト (
              キャラクターID INTEGER,
              レアリティ TEXT,
              カード名 TEXT,
              カードIndex1 INTEGER,
              カードIndex2 INTEGER
            );
          `);
          resolve(db);
        };
        getReq.onerror = () => reject("読み出し失敗");
      };
      request.onerror = () => reject("IndexedDB接続失敗");
    });
  };

  const insertCharMaster = (charList) => {
    charList.forEach(c => {
      db.run("INSERT OR IGNORE INTO キャラクター VALUES (?, ?);", [c.charid, c.charname]);
    });
  };

  const getCharList = () => {
    const result = db.exec("SELECT キャラクターID, キャラクター名 FROM キャラクター;");
    return result.length ? result[0].values : [];
  };

  const getAllCards = () => {
    const result = db.exec(`
      SELECT c.キャラクターID, ch.キャラクター名, c.レアリティ, c.カード名, c.カードIndex1, c.カードIndex2
      FROM カードリスト c
      LEFT JOIN キャラクター ch ON c.キャラクターID = ch.キャラクターID;
    `);
    if (!result.length) return [];
    const columns = result[0].columns;
    const values = result[0].values;
    return values.map(row => {
      const card = {};
      row.forEach((val, i) => card[columns[i]] = val);
      return card;
    });
  };

  const updateCard = (id, rarity, name, index1, index2) => {
    const stmt = db.prepare(`
      INSERT INTO カードリスト (キャラクターID, レアリティ, カード名, カードIndex1, カードIndex2)
      VALUES (?, ?, ?, ?, ?)
      ON CONFLICT(キャラクターID) DO UPDATE SET
        レアリティ = excluded.レアリティ,
        カード名 = excluded.カード名,
        カードIndex1 = excluded.カードIndex1,
        カードIndex2 = excluded.カードIndex2;
    `);
    stmt.run([id, rarity, name, index1, index2]);
    stmt.free();
  };

  const deleteCard = (id) => {
    db.run(`DELETE FROM カードリスト WHERE キャラクターID = ?;`, [id]);
  };

  const exportToIndexedDB = () => {
    const binaryArray = db.export();
    const request = indexedDB.open("CardDB", 1);
    request.onsuccess = event => {
      const idb = event.target.result;
      const tx = idb.transaction("sqlite", "readwrite");
      tx.objectStore("sqlite").put({ id: 1, data: binaryArray });
      tx.oncomplete = () => console.log("保存完了");
    };
    request.onerror = () => console.error("保存失敗");
  };

  return {
    init,
    loadFromIndexedDB,
    insertCharMaster,
    getCharList,
    getAllCards,
    updateCard,
    deleteCard,
    exportToIndexedDB
  };
})();