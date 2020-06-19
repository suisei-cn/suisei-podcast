const podcast = require("podcast");
const unirest = require("unirest");
const Podcast = require("podcast");
const dayjs = require("dayjs");

function generateContent(item, original, time) {
  return `
    <p>Song name: ${item.title}</p>
    ${
      original
        ? `<p>An original song by 星街すいせい</p>`
        : `<p>Originally by ${item.artist}</p>`
    }
    <p>Performed at: ${time}</p>
    <br>
    <p>
    This podcast is powered by suisei-cn. See the music list <a href="https://github.com/suisei-cn/suisei-music/">here</a>. <br>
    If things don't seem right, report it <a href="https://github.com/suisei-cn/suisei-podcast/issues">here</a>.
    </p>
    `;
}

(async () => {
  const resp = await unirest.get("https://suisei-music.darknode.workers.dev");
  const body = resp.body;
  const feed = new Podcast({
    title: "Suisei Music Podcast",
    description:
      "Collection of music of suisei. Powered by suisei-cn. This is a temporary trial example. The production version might be released later at a different location.",
    generator: "podcast@npmjs",
    feedUrl: "https://suisei-cn.github.io/suisei-podcast/feed.xml",
    siteUrl: "https://github.com/suisei-cn/suisei-podcast",
    imageUrl:
      "https://cdn.jsdelivr.net/gh/suisei-cn/suisei-podcast@1.1/smp-logo.png",
    author: "星街すいせい工房",
    categories: ["music", "virtual youtuber"],
    itunesType: "episodic",
    itunesCategory: [
      {
        text: "Arts",
        subcats: [{ text: "Performing Arts" }],
      },
    ],
    pubDate: new Date(),
  });
  for (const i of body) {
    const time = new Date(i.datetime);
    const readableTime = dayjs(time).format("YYYY/MM/DD HH:mm");
    feed.addItem({
      title: i.title,
      description:
        i.artist === "星街すいせい"
          ? `${i.title}, an original song by 星街すいせい performed on ${readableTime}.`
          : `${i.title}, originally by ${i.artist}, performed by 星街すいせい on ${readableTime}`,
      content: generateContent(i, i.artist === "星街すいせい", readableTime),
      url: i.url,
      enclosure: {
        url: i.url,
      },
      date: time,
    });
  }
  console.log(feed.buildXml("  "));
})();
