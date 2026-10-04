import { LoadMore } from "papo-na-arena-ds";

const noun = { all: "Mostrar todos", lastOne: "o último produto", lastMany: "os últimos" };

export const MoreAndAll = () => <LoadMore visible={20} total={642} step={20} noun={noun} onShow={() => {}} />;

export const LastFew = () => <LoadMore visible={640} total={642} step={20} noun={noun} onShow={() => {}} />;
