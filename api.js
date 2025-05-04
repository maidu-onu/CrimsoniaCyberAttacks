class API {
  constructor() {
    this.db_url = window.location.hostname.includes("netlify.app")
      ? "/api"
      : "http://20.39.193.222:5000";
    console.log(this.db_url);
  }

  async getData(team) {
    try {
      const response = await fetch(`${this.db_url}/data?team=${team}`);
      if (!response.ok) throw new Error(`Error: ${response.status}`);
      return await response.json();
    } catch (error) {
      console.error(error);
      return null;
    }
  }

  async deleteField(team, field) {
    try {
      const response = await fetch(`${this.db_url}/data/delete`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ team, field }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error);
      console.log(`Success: ${result.message}`);
      return true;
    } catch (error) {
      console.error(error);
      return false;
    }
  }
}
export default API;
