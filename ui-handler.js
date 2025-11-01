async function refreshTable() {
  await SQLiteLoader.init();
  await SQLiteLoader.loadFromIndexedDB();
  populateDropdown();
  const cards = SQLiteLoader.getAllCards();
  const tbody = document.querySelector("#card-table tbody");
  tbody.innerHTML = "";

  cards.forEach(card => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${card["キャラクターID"]}</td>
      <td>${card["キャラクター名"] || "不明"}</td>
      <td>${card["レアリティ"]}</td>
      <td>${card["カード名"]}</td>
      <td>${card["カードIndex1"]}</td>
      <td>${card["カードIndex2"]}</td>
      <td>
        <button onclick="editCard(${card['キャラクターID']})">編集</button>
        <button onclick="deleteCard(${card['キャラクターID']})">削除</button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

function populateDropdown() {
  const select = document.getElementById("charId");
  select.innerHTML = "";
  const list = SQLiteLoader.getCharList();
  list.forEach(([id, name]) => {
    const option = document.createElement("option");
    option.value = id;
    option.textContent = `${id} - ${name}`;
    select.appendChild(option);
  });
}
