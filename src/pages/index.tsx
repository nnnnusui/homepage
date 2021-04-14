import React from "react";
import { NextPage } from "next";
import Link from "../components/Link";
import Title from "../components/Title";

const Home: NextPage = () => {
  return (
    <section className="h-full w-full flex flex-col justify-center text-center">
      <Title />
      <p className="url">nnnnusui.ga</p>
      <ul className="domains">
        <li>
          <a href="/blog">blog</a>
        </li>
      </ul>
      <ul className="links">
        <li>
          <Link service="twitter" url="https://twitter.com/nnnnusui_public" />
        </li>
        <li>
          <Link service="github" url="https://github.com/nnnnusui" />
        </li>
        <li>
          <Link
            service="soundcloud"
            url="https://soundcloud.com/next_for_your_ideal"
          />
        </li>
        <li>
          <Link
            service="niconico"
            url="https://www.nicovideo.jp/user/9425987"
          />
        </li>
        <li>
          <Link
            service="youtube"
            url="https://www.youtube.com/channel/UCbKHgc19qt13_kA95c9Ht3A"
          />
        </li>
        <li>
          <Link service="steam" url="https://steamcommunity.com/id/nnnnusui/" />
        </li>
      </ul>
    </section>
  );
};

export default Home;
