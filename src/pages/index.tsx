import React from "react";
import { NextPage } from "next";
import Link from "../components/Link";
import Title from "../components/Title";

const Home: NextPage = () => {
  return (
    <section className="h-full w-full flex flex-col justify-center text-center">
      <Title />
      <p>nnnnusui.ga</p>
      <section className="flex justify-center">
        {/* <h1 className="text-center">Links</h1> */}
        <Link service="twitter" url="https://twitter.com/nnnnusui_public" />
        <Link service="github" url="https://github.com/nnnnusui" />
        <Link
          service="soundcloud"
          url="https://soundcloud.com/next_for_your_ideal"
        />
        <Link service="niconico" url="https://www.nicovideo.jp/user/9425987" />
        <Link
          service="youtube"
          url="https://www.youtube.com/channel/UCbKHgc19qt13_kA95c9Ht3A"
        />
      </section>
    </section>
  );
};

export default Home;
