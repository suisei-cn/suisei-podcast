const unirest = require("unirest");
const Podcast = require("podcast");
const dayjs = require("dayjs");

function generateNotice(item) {
  let ret = [];
  const status = item.status || 0;
  if (status & 1) {
    ret.push("🎤 This clip is an acappella with no background music.");
  }
  if (status & 2) {
    ret.push(
      "😟 The source for this clip is corrupted due to various problems."
    );
  }
  if (status & 4) {
    ret.push(
      "🔇 This clip is muted in the source due to concerns on copyright."
    );
  }
  if (ret.length !== 0) {
    return (
      "<p>This episode has the following flags:\n<ul>" +
      ret.map((x) => `<li>${x}</li>`).join("\n") +
      "</ul>\n</p>"
    );
  } else {
    return "";
  }
}

function generateContent(item, original, time) {
  return `
    <p>Song name: ${item.title}</p>
    ${
      original
        ? `<p>An original song by 星街すいせい</p>`
        : `<p>Originally by ${item.artist}</p>`
    }
    <p>Performed by ${item.performer} at ${time}</p>
    <p>Source: <a href="${item.source}">${item.source}</a></p>
    ${generateNotice(item)}
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
