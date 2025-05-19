import InsertChartIcon from "@mui/icons-material/InsertChart";
import MenuIcon from "@mui/icons-material/Menu";
import { observer } from "mobx-react-lite";
import { Dispatch, SetStateAction, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import anon from "../assets/anon.jpg";
import { Page } from "../constants/interfaces";
import { ResponsiveDrawer } from "./MyDrawer";
import { MyDropdownMenu } from "./MyDropdownMenu";

const NavLink = (props: { page: Page }) => {
  const { page } = props;

  return (
    <Link
      to={page.link ?? ""}
      className={
        page.selected
          ? "md:text-gray-300 font-bold"
          : "md:text-blue-500 font-bold"
      }
    >
      {page.title}
    </Link>
  );
};

export const MyNavBar = observer(
  (props: {
    title?: string;
    drawerOpen?: boolean;
    setDrawerOpen?: Dispatch<SetStateAction<boolean>>;
    location?: string;
    setLocation?: Dispatch<SetStateAction<string>>;
    profileUrl?: string;
    paths?: Page[];
  }) => {
    const {
      title,
      drawerOpen,
      setDrawerOpen,
      setLocation,
      profileUrl,
      paths,
      location,
    } = props;

    const navigate = useNavigate();

    const [open2, setOpen2] = useState(false);

    const onClickLogout = async () => {
      navigate("/login");
    };

    return (
      <nav className="relative bg-white border-gray-200 dark:bg-gray-900">
        <ResponsiveDrawer
          open={drawerOpen}
          setOpen={setDrawerOpen}
          paths={paths}
          location={location}
          setLocation={setLocation}
        />
        <div className="flex flex-wrap items-center justify-between mx-auto p-4">
          <div className="flex items-center space-x-3 rtl:space-x-reverse">
            <Link to={"/"}>
              <InsertChartIcon
                fontSize="large"
                className="text-gray-700 dark:text-gray-100 hover:text-green-700 hover:scale-125 [&:not(hover)]:transition-all hover:transition-all ease-in-out hover:animate-pulse"
                onClick={() => setLocation && setLocation("/")}
              />
            </Link>
            <span className="self-center text-2xl font-semibold whitespace-nowrap dark:text-white">
              {title}
            </span>
          </div>

          <div className="md:w-auto" id="navbar-default">
            <ul className="font-medium flex flex-col items-center justify-center md:p-0 mt-4 border border-gray-100 rounded-lg bg-gray-50 md:flex-row md:space-x-8 rtl:space-x-reverse md:mt-0 md:border-0 md:bg-white dark:bg-gray-800 md:dark:bg-gray-900 dark:border-gray-700">
              {paths?.map((s, ind) => (
                <div
                  onClick={() => setLocation && s.link && setLocation(s.link)}
                  key={ind}
                  className="hidden lg:block"
                >
                  <NavLink page={s} />
                </div>
              ))}
              <div className="items-center content-center place-items-center place-content-center justify-center justify-items-center">
                <img
                  className="w-8 h-8 rounded-full cursor-pointer hidden lg:block"
                  src={profileUrl}
                  onClick={() => setOpen2((t) => !t)}
                  onError={(e) => {
                    e.currentTarget.src = anon;
                  }}
                />
                <MyDropdownMenu
                  setOpen={setOpen2}
                  open={open2}
                  pages={[
                    ...(paths?.map((s) => ({
                      title: s.title,
                      selected: false,
                      onClick: () => {
                        setLocation && s.link && setLocation(s.link);
                        navigate(s?.link ?? "/");
                        setOpen2(false);
                      },
                    })) ?? []),
                    {
                      title: "Logout",
                      selected: false,
                      onClick: onClickLogout,
                    },
                  ]}
                />
              </div>
              <li>
                <div
                  className="inline-flex items-center p-2 w-10 h-10 justify-center text-sm text-gray-500 rounded-lg hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200 dark:text-gray-400 dark:hover:bg-gray-700 dark:focus:ring-gray-600"
                  onClick={setDrawerOpen && (() => setDrawerOpen((t) => !t))}
                >
                  <MenuIcon />
                </div>
              </li>
            </ul>
          </div>
        </div>
      </nav>
    );
  }
);
